import { type ActionType, createAction } from 'typesafe-actions';

import { type TgoId } from '../reducers/tgo.ts';
import { inventoryActions, type InventoryItem, type Inventory, type ComponentInventory } from './inventory.ts';
import { tgosReducer, getTgoByIdFromRootState } from '../concerns/tgos.ts';
import { type RootStateType } from '../reducers/index.ts';

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

export const transactionActions = {
	transaction,
};
export type WorkActionType = ActionType<typeof transactionActions>;

export interface TransactionParticipant {
	readonly tgoId: TgoId;
	readonly items: Inventory;
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

		const getInventoryCountOfTypeId = (inventory: Inventory, { typeId, tgoId }: InventoryItem) =>
			(
				inventory.find(ii => (ii.typeId == 'tgoId' && ii.tgoId == tgoId) || (ii.typeId != 'tgoId' && ii.typeId == typeId))
				|| { count: 0 }
			).count
	
		const participantsWithItemBalance = verifiedParticipantsWithTgo
			.map(participant => ({
				...participant,
				itemsBalance: participant.items.map(item => ({
					...item,
					finalCount: getInventoryCountOfTypeId(participant.tgo.inventory ?? [], item) + item.count,
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

		const participantWithPositiveOnlyInventoryFilter = (tgo: Partial<ComponentInventory>) => tgo.inventory && tgo.inventoryIsPhysical;
		const flattenedItemsWithPositiveOnlyInventories = participantsWithItemBalanceVerifiedTypes
			.filter(participantWithPositiveOnlyInventoryFilter)
			.map(({ itemsBalance }) => itemsBalance)
			.flat();

		const positiveOnlyFails = flattenedItemsWithPositiveOnlyInventories.filter(item => !verifyPositiveOnly(item));
		if (positiveOnlyFails.length > 0)
			throw new Error(`Transaction requirements - positiveOnly not met for items: ${JSON.stringify(positiveOnlyFails)}`);

		const createInventoryAddForParticipant = ({ tgoId, items }: { tgoId: TgoId, items: Inventory }) =>
			items.map(item => inventoryActions.add(tgoId, item.typeId, item.count));
		const inventoryAdds: ReturnType<typeof inventoryActions.add>[] = participantsWithItemBalanceVerifiedTypes
			.map(createInventoryAddForParticipant).flat(1);

		return inventoryAdds.reduce(
			(currentTgosState, inventoryAdd) => tgosReducer(currentTgosState, inventoryAdd),
			tgosState
		);
	} catch (e) {
		console.error('Transaction failed with:', e);
		return tgosState;
	}
};
