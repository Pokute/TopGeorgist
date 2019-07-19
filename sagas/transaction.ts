import { put, select, takeEvery, all, call } from 'redux-saga/effects';
import { ActionType, getType } from 'typesafe-actions';

import { inventoryActions, InventoryItem, Inventory, ComponentInventory } from '../components/inventory';
import * as transactionActions from '../actions/transaction';
import * as taskQueueActions from '../actions/taskQueue';
import { TgoId, TgoType } from '../reducers/tgo';
import { TypeId, ItemType } from '../reducers/itemType';
import { TgosState, getTgoByIdFromRootState } from '../reducers/tgos';
import { ItemTypesState } from '../reducers/itemTypes';
import { RootStateType } from '../reducers';

export interface TransactionParticipant {
	readonly tgoId: TgoId,
	readonly items: Inventory
};

export type TransactionActionType = ActionType<typeof transactionActions>;

export const transactionSaga2 = function* ({ payload: { participants } }: ReturnType<typeof transactionActions.transaction>) {
	if (!participants.every((p) => {
		if (!p) return false;
		if (!p.tgoId) return false;
		return true;
	})) {
		console.log('Participants are wrong!');
		return false;
	}

	const { itemTypes, tgos }: RootStateType = yield select(({ itemTypes, tgos }) => ({ itemTypes, tgos }));

	const getTgoById = getTgoByIdFromRootState(tgos);

	const getTgoForParticipants = <T extends TransactionParticipant>({ tgoId, ...rest }: T) => ({
		...rest,
		tgoId,
		tgo: getTgoById(tgoId),
	})
	const addItemType = ({ typeId, ...rest}: TransactionParticipant['items'][0]) => ({
		...rest,
		typeId,
		type: itemTypes[typeId],
	});

	const participantsWithTgo = participants
		.map(getTgoForParticipants)
	if (participantsWithTgo.some(({ tgo }) => !tgo))
		throw new Error('Participant tgoId does not have tgo!');
	
	const verifiedParticipantsWithTgo = participantsWithTgo.map(({ tgo, ...rest }) => ({
		...rest,
		tgo: tgo!,
	}));

	const createDummyInventory = <T extends Partial<ComponentInventory>>(tgo: T) => ({
		...tgo,
		inventory: tgo.inventory || [],
	});
	const createDummyInventoriesForParticipants = <T extends typeof verifiedParticipantsWithTgo[0]>({ tgo, ...rest }: T) => ({
		...rest,
		tgo: createDummyInventory(tgo),
	});
	const participantsWithInventories = verifiedParticipantsWithTgo.map(createDummyInventoriesForParticipants);

	const getInventoryCountOfTypeId = (inventory: Inventory, { typeId, tgoId }: InventoryItem) =>
		(
			inventory.find(ii => (ii.typeId == 'tgoId' && ii.tgoId == tgoId) || (ii.typeId != 'tgoId' && ii.typeId == typeId))
			|| { count: 0 }
		).count

	const participantsWithItemBalance = participantsWithInventories
		.map(participant => ({
			...participant,
			itemsBalance: participant.items.map(item => ({
				...item,
				finalCount: getInventoryCountOfTypeId(participant.tgo.inventory, item) - item.count,
			})),
		}));
	
	const participantsWithItemBalanceTypes = participantsWithItemBalance.map(participant => ({
		...participant,
		itemsBalance: participant.itemsBalance.map(addItemType),
	}));
	
	if (participantsWithItemBalanceTypes.some(({ itemsBalance }) => itemsBalance.some(({ type }) => !type)))
	throw new Error('Participant item doesn\'t have a matching item type');
			
	const participantsWithItemBalanceVerifiedTypes = participantsWithItemBalanceTypes.map(({ tgo, itemsBalance, ...rest }) => ({
		...rest,
		itemsBalance: itemsBalance.map(({ type, ...itemsRest }) => ({
			...itemsRest,
			type: type!,
		})),
	}));

	const verifyStackable = ({ count, type: { stackable } }: typeof participantsWithItemBalanceVerifiedTypes[0]['itemsBalance'][0] ) => !stackable || ( count === 0 || count === 1);
	const verifyPositiveOnly = ({ count, type: { positiveOnly } }: typeof participantsWithItemBalanceVerifiedTypes[0]['itemsBalance'][0] ) => !positiveOnly || count >= 0;
	const verifyIsInteger = ({ count, type: { isInteger } }: typeof participantsWithItemBalanceVerifiedTypes[0]['itemsBalance'][0] ) => !isInteger || count === Math.floor(count);

	if (!participantsWithItemBalanceVerifiedTypes.every(({ itemsBalance }) =>
		!itemsBalance.every(verifyStackable)
		&& !itemsBalance.every(verifyPositiveOnly)
		&& !itemsBalance.every(verifyIsInteger)
	))
		throw new Error('Transaction requirements not met.');

	const createInventoryAddForParticipant = ({ tgoId, items }: { tgoId: TgoId, items: Inventory }) =>
		items.map(item => inventoryActions.add(tgoId, item.typeId, item.count));
	const inventoryAdds: ReturnType<typeof inventoryActions.add>[] = participantsWithItemBalanceVerifiedTypes
		.map(createInventoryAddForParticipant).flat(1);
	yield all(inventoryAdds.map(a => put(a)));
};

export const transactionSaga = function* ({ payload: { participants } }: ReturnType<typeof transactionActions.transaction>) {

	if (!participants.every((p) => {
		if (!p) return false;
		if (!p.tgoId) return false;
		return true;
	})) {
		console.log('Participants are wrong!');
		return false;
	}

	interface InventoryItemWithInfo extends InventoryItem {
		readonly type: ItemType,
		readonly ownerCount: number,
	};
	
	interface TransactionParticipantWithInfo {
		readonly tgoId: TgoId,
		readonly items: ReadonlyArray<InventoryItemWithInfo>
		readonly isInventoryVirtual?: ComponentInventory['isInventoryVirtual'],
	};
	
	const getParticipantWithInfo = function*(p: TransactionParticipant) {
		const pTgo = yield select((state: { tgos: TgosState }) => state.tgos[p.tgoId]);
		const newItems: InventoryItemWithInfo = yield all(p.items.map((item) => call(function* (i) {
			return {
				...i,
				type: yield select((state: { itemTypes: ItemTypesState }) => state.itemTypes[i.typeId]),
				ownerCount: {
					count: 0,
					...(pTgo.inventory || []).find((ii : { typeId: TypeId }) => ii.typeId === i.typeId),
				}.count || 0,
			};
		}, item)));
		return {
			...p,
			items: newItems,
			inventoryVirtual: pTgo.inventoryVirtual,
		};
	}

	const participantsWithInfo: ReadonlyArray<TransactionParticipantWithInfo> = yield all(participants.map(p => call(getParticipantWithInfo, p)));

	const participantsWithInfo2: ReadonlyArray<TransactionParticipantWithInfo> = yield* (participants.map(function* (p) {
		const pTgo = yield select((state: { tgos: TgosState }) => state.tgos[p.tgoId]);
		const newItems: InventoryItemWithInfo = yield p.items.map(function* (i) {
			return {
				...i,
				type: yield select((state: { itemTypes: ItemTypesState }) => state.itemTypes[i.typeId]),
				ownerCount: {
					count: 0,
					...(pTgo.inventory || []).find((ii : { typeId: TypeId }) => ii.typeId === i.typeId),
				}.count || 0,
			};
		});
		return {
			...p,
			items: newItems,
		};
	}));

	const allPraticipantsHaveItems = participantsWithInfo.every((p) =>
		(p.isInventoryVirtual == true) ||
		p.items.every(i =>
			(((i.ownerCount + i.count) >= 0) || !i.type.positiveOnly),
		),
	);
	if (!allPraticipantsHaveItems) return false; // There's not enough items to satisfy transaction.

	const actions: ReadonlyArray<ReturnType<typeof inventoryActions.add>> = participantsWithInfo.reduce(
		(total: ReadonlyArray<ReturnType<typeof inventoryActions.add>>, p) => [
			...total,
			...p.items
				.map(i => inventoryActions.add(p.tgoId, i.typeId, i.count)),
		],
		[],
	);

	yield all(actions.map(a => put(a)));
	return true;
};

const storeTransactionRequest = function* ({ payload: { tgoId, items, visitableTgoId } }: ReturnType<typeof transactionActions.storeTransactionRequest>) {
	yield put(taskQueueActions.addTaskQueue(
		tgoId,
		[{
			title: `Trading`,
			progress: {
				time: 0,
			},
			cost: {
				time: 12,
			},
			completionAction: transactionActions.transaction(
				{
					tgoId: tgoId,
					items: items,
				},
				{
					tgoId: visitableTgoId,
					items: items.map(i => ({ ...i, count: -1 * i.count })),
				},
			),
		}],
	));
};

const transactionListener = function* () {
	yield takeEvery('TRANSACTION', transactionSaga);
	yield takeEvery('STORE_TRANSACTION_REQUEST', storeTransactionRequest);
};

export default transactionListener;
