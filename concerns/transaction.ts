import { put, takeEvery }  from 'typed-redux-saga';
import { ActionType, createAction, getType } from 'typesafe-actions';

import { TgoId } from '../reducers/tgo.js';
import { inventoryActions, InventoryItem, Inventory, ComponentInventory } from './inventory.js';
import * as taskQueueActions from '../actions/taskQueue.js';
import tgos, { getTgoByIdFromRootState } from '../reducers/tgos.js';
import { RootStateType } from '../reducers/index.js';

// Actions:

export const transaction = createAction('TRANSACTION',
	(...participants: TransactionParticipant[]) => {
		if (participants.length == 0) throw new Error('Can\'t create a transaction with no participants');
		if (participants.some(p => !p.tgoId)) throw new Error('Transaction participant has no tgoId!');
		return ({
			participants,
		});
	}
)();

export const storeTransactionRequest = createAction('STORE_TRANSACTION_REQUEST',
	(tgoId: TgoId, visitableTgoId: TgoId, items: ReadonlyArray<InventoryItem>) => ({
		tgoId,
		visitableTgoId,
		items,
	})
)();

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

const handleStoreTransactionRequest = function* ({ payload: { tgoId, items, visitableTgoId } }: ReturnType<typeof transactionActions.storeTransactionRequest>) {
	yield* put(taskQueueActions.addTaskQueue(
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
	yield* takeEvery('STORE_TRANSACTION_REQUEST', handleStoreTransactionRequest);
};

// Reducer:

export const transactionReducer = (
	tgosState: RootStateType['tgos'],
	itemTypesState: RootStateType['itemTypes'],
	{ payload: { participants } }: ActionType<typeof transaction>
): RootStateType['tgos'] => {
	try {
		if (!participants.every((p) => {
			if (!p) return false;
			if (!p.tgoId) return false;
			return true;
		})) {
			throw new Error('Transaction - Participant list has invalid participants.');
		}

		const getTgoById = getTgoByIdFromRootState(tgosState);

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
			type: itemTypesState[typeId],
		});
	
		const participantsWithItemBalanceTypes = participantsWithItemBalance.map(participant => ({
			...participant,
			itemsBalance: participant.itemsBalance.map(addItemType),
		}));
		
		const itemBalancesWithoutTypes = participantsWithItemBalanceTypes.flatMap(({ itemsBalance }) => itemsBalance.filter(({ type }) => !type));
	
		if (itemBalancesWithoutTypes.length > 0) {
			throw new Error(`Transaction item of type "${itemBalancesWithoutTypes[0].typeId}" ${itemBalancesWithoutTypes.length > 1 ? `and (${itemBalancesWithoutTypes.length - 1} others) ` : ''}doesn\'t have a matching item type (store.itemTypes["${itemBalancesWithoutTypes[0].typeId}"]).`);
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
	
		const flattenedItemsBalance = participantsWithItemBalanceVerifiedTypes
			.map(({ itemsBalance }) => itemsBalance)
			.flat();
	
		const stackableFails = flattenedItemsBalance.filter(item => !verifyStackable(item));
		if (stackableFails.length > 0)
			throw new Error(`Transaction requirements - stackable not met for items: ${JSON.stringify(stackableFails)}`);
	
		const isIntegerFails = flattenedItemsBalance.filter(item => !verifyIsInteger(item));
		if (isIntegerFails.length > 0)
			throw new Error(`Transaction requirements - isInteger not met for items: ${JSON.stringify(isIntegerFails)}`);

		const notParticipantWithVirtualInventoryFilter = ({ tgo: { isInventoryVirtual }}: { tgo: ComponentInventory } ) => !isInventoryVirtual;
		const flattenedItemsBalanceWithoutVirtualInventories = participantsWithItemBalanceVerifiedTypes
			.filter(notParticipantWithVirtualInventoryFilter)
			.map(({ itemsBalance }) => itemsBalance)
			.flat();
				
		const positiveOnlyFails = flattenedItemsBalanceWithoutVirtualInventories.filter(item => !verifyPositiveOnly(item));
		if (positiveOnlyFails.length > 0)
			throw new Error(`Transaction requirements - positiveOnly not met for items: ${JSON.stringify(positiveOnlyFails)}`);

		const createInventoryAddForParticipant = ({ tgoId, items }: { tgoId: TgoId, items: Inventory }) =>
			items.map(item => inventoryActions.add(tgoId, item.typeId, item.count));
		const inventoryAdds: ReturnType<typeof inventoryActions.add>[] = participantsWithItemBalanceVerifiedTypes
			.map(createInventoryAddForParticipant).flat(1);

		return inventoryAdds.reduce(
			(currentTgosState, inventoryAdd) => tgos(currentTgosState, inventoryAdd),
			tgosState
		);
	} catch (e) {
		console.error('Transaction failed with:', e);
		return tgosState;
	}
};
