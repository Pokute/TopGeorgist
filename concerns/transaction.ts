import { select, put, all, call, takeEvery } from 'redux-saga/effects';
import { ActionType, createAction, getType } from 'typesafe-actions';

import { TgoId } from '../reducers/tgo';
import { inventoryActions, InventoryItem, Inventory, ComponentInventory } from '../components/inventory';
import * as taskQueueActions from '../actions/taskQueue';
import { TypeId, ItemType } from '../reducers/itemType';
import { TgosState, getTgoByIdFromRootState } from '../reducers/tgos';
import { ItemTypesState } from '../reducers/itemTypes';
import { RootStateType } from '../reducers';

// Actions:

export const transaction = createAction('TRANSACTION', (resolve) => {
	return (...participants: TransactionParticipant[]) => {
		if (participants.length == 0) throw new Error('Can\'t create a transaction with no participants');
		if (participants.some(p => !p.tgoId)) throw new Error('Transaction participant has no tgoId!');
		return resolve({
			participants,
		});
	};
});

export const storeTransactionRequest = createAction('STORE_TRANSACTION_REQUEST', (resolve) => {
	return (tgoId: TgoId, visitableTgoId: TgoId, items: ReadonlyArray<InventoryItem>) => resolve({
		tgoId,
		visitableTgoId,
		items,
	});
});

export const transactionActions = {
	transaction,
	storeTransactionRequest,
};
export type WorkActionType = ActionType<typeof transactionActions>;

// Sagas:


export interface TransactionParticipant {
	readonly tgoId: TgoId;
	readonly items: Inventory;
};

export type TransactionActionType = ActionType<typeof transactionActions>;

export const transactionSaga = function* ({ payload: { participants } }: ReturnType<typeof transactionActions.transaction>) {
	if (!participants.every((p) => {
		if (!p) return false;
		if (!p.tgoId) return false;
		return true;
	})) {
		throw new Error('Transaction - Participant list has invalid participants.');
	}

	const { itemTypes, tgos }: RootStateType = yield select(({ itemTypes, tgos }) => ({ itemTypes, tgos }));

	const getTgoById = getTgoByIdFromRootState(tgos);

	const getTgoForParticipants = <T extends TransactionParticipant>({ tgoId, ...rest }: T) => ({
		...rest,
		tgoId,
		tgo: getTgoById(tgoId),
	})
	const participantsWithTgo = participants
		.map(getTgoForParticipants);
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
				finalCount: getInventoryCountOfTypeId(participant.tgo.inventory, item) + item.count,
			})),
		}));

	const addItemType = ({ typeId, ...rest}: typeof participantsWithItemBalance[0]['itemsBalance'][0]) => ({
		...rest,
		typeId,
		type: itemTypes[typeId],
	});

	const participantsWithItemBalanceTypes = participantsWithItemBalance.map(participant => ({
		...participant,
		itemsBalance: participant.itemsBalance.map(addItemType),
	}));
	
	const itemBalancesWithoutTypes = participantsWithItemBalanceTypes.flatMap(({ itemsBalance }) => itemsBalance.filter(({ type }) => !type));

	if (itemBalancesWithoutTypes.length > 0) {
		throw new Error(`Transaction item of type "${itemBalancesWithoutTypes[0].typeId}" ${itemBalancesWithoutTypes.length > 1 ? `and (${itemBalancesWithoutTypes.length - 1} others) ` : ''}doesn\'t have a matching item type.`);
	}
	
	const participantsWithItemBalanceVerifiedTypes = participantsWithItemBalanceTypes.map(({ itemsBalance, ...rest }) => ({
		...rest,
		itemsBalance: itemsBalance.map(({ type, ...itemsRest }) => ({
			...itemsRest,
			type: type!,
		})),
	}));
	
	type ItemBalance = typeof participantsWithItemBalanceVerifiedTypes[0]['itemsBalance'][0];

	// TODO: Support virtual inventories!
	const verifyStackable = ({ finalCount, type: { stackable } }: ItemBalance ) => stackable || ( finalCount === 0 || finalCount === 1);
	const verifyPositiveOnly = ({ finalCount, type: { positiveOnly } }: ItemBalance ) => !positiveOnly || finalCount >= 0;
	const verifyIsInteger = ({ finalCount, type: { isInteger } }: ItemBalance ) => !isInteger || finalCount === Math.floor(finalCount);

	const notParticipantWithVirtualInventoryFilter = ({ tgo: { isInventoryVirtual }}: { tgo: ComponentInventory } ) => !isInventoryVirtual;

	if (!participantsWithItemBalanceVerifiedTypes.every(({ itemsBalance }) =>
		itemsBalance.every(verifyStackable)
	))
		throw new Error('Transaction requirements - stackable not met.');

	if (!participantsWithItemBalanceVerifiedTypes
		.filter(notParticipantWithVirtualInventoryFilter).every(({ itemsBalance }) =>
			itemsBalance.every(verifyPositiveOnly)
		))
		throw new Error('Transaction requirements - positiveOnly not met.');

	if (!participantsWithItemBalanceVerifiedTypes.every(({ itemsBalance }) =>
		itemsBalance.every(verifyIsInteger)
	))
		throw new Error('Transaction requirements - integer not met.');

	const createInventoryAddForParticipant = ({ tgoId, items }: { tgoId: TgoId, items: Inventory }) =>
		items.map(item => inventoryActions.add(tgoId, item.typeId, item.count));
	const inventoryAdds: ReturnType<typeof inventoryActions.add>[] = participantsWithItemBalanceVerifiedTypes
		.map(createInventoryAddForParticipant).flat(1);
	yield all(inventoryAdds.map(a => put(a)));
};

const transactionSagaCatcher = function* (action: ReturnType<typeof transactionActions.transaction>) {
	try {
		yield* transactionSaga(action);
	} catch (e) {
		console.error('Transaction failed with:', e);
	}
}

const handleStoreTransactionRequest = function* ({ payload: { tgoId, items, visitableTgoId } }: ReturnType<typeof transactionActions.storeTransactionRequest>) {
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

export const transactionRootSaga = function* () {
	yield takeEvery('TRANSACTION', transactionSagaCatcher);
	yield takeEvery('STORE_TRANSACTION_REQUEST', handleStoreTransactionRequest);
};
