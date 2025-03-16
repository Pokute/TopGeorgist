import { type ActionType, getType, createAction } from 'typesafe-actions';

import { type TgoId, type TgoType, type TgoRoot } from '../reducers/tgo.ts';
import { type TypeId } from '../reducers/itemType.ts';

// Actions:

export const add = createAction('TGO_INVENTORY_ADD',
	(ownerTgoId: TgoId, typeId: TypeId, count: number = 1) => {
		if (!typeId) throw new Error('inventory.add can\'t have empty typeId');
		return ({
			tgoId: ownerTgoId,
			item: {
				typeId,
				count,
			},
		})
	}
)();

export const addTgoId = createAction('TGO_INVENTORY_ADD_TGO_ID',
	(ownerTgoId: TgoId, tgoId: TgoId) => {
		if (!tgoId) throw new Error('inventory.addTgoId can\'t have empty item.tgoId');
		return ({
			tgoId: ownerTgoId,
			item: {
				tgoId,
			},
		});
	}
)();

export const removeTgoId = createAction('TGO_INVENTORY_REMOVE_TGO_ID',
	(ownerTgoId: TgoId, tgoId: TgoId) => {
		if (!tgoId) throw new Error('inventory.removeTgoId can\'t have empty item.tgoId');
		return ({
			tgoId: ownerTgoId,
			item: {
				tgoId,
			},
		});
	}
)();

export const inventoryActions = {
	add,
	addTgoId,
	removeTgoId,
};

// Reducer:

export interface InventoryItem {
	readonly typeId: TypeId,
	readonly count: number,
	readonly tgoId? : TgoId,
};

export type Inventory = ReadonlyArray<InventoryItem>;

const initialState: Inventory = [];

export type InventoryActionType = ActionType<typeof inventoryActions>;
export const InventoryActionList = [
	add,
];

export const reducer = (state: Inventory = initialState, action: InventoryActionType): Inventory => {
	switch (action.type) {
		case getType(add): {
			const existingItem = state.find(ii => ii.typeId === action.payload.item.typeId);
			const existingCount = existingItem ? existingItem.count : 0;
			return [
				...state.filter(ii => ii.typeId !== action.payload.item.typeId),
				{
					...action.payload.item,
					count: action.payload.item.count + existingCount,
				},
			];
		}
		case getType(addTgoId): {
			if (state.some(({ typeId, tgoId }) => (
					typeId == 'tgoId' 
					&& tgoId == action.payload.item.tgoId
				)
			)) {
				throw new Error(`Trying to add an already existing tgoId ${action.payload.item.tgoId} to inventory of ${action.payload.tgoId}`);
			}
			return [
				...state,
				{
					typeId: 'tgoId' as TypeId,
					count: 1,
					tgoId: action.payload.item.tgoId,
				}
			];
		}
		case getType(removeTgoId): {
			const stateWithoutRemovedTgoId = state.filter(({ typeId, tgoId }) => (
				typeId == 'tgoId' 
				&& tgoId == action.payload.item.tgoId
			) == false);
			if (stateWithoutRemovedTgoId.length == state.length) {
				throw new Error(`Trying to add an remove non-existing tgoId ${action.payload.item.tgoId} from inventory of ${action.payload.tgoId}`);
			}
			return stateWithoutRemovedTgoId;
		}
		default:
			return state;
	}
};

// Utility funcs:

export const inventory = Object.assign(
	function copyFrom(other: Inventory): Inventory {
		return (other.map(ii => ({
			typeId: ii.typeId,
			tgoId: ii.tgoId,
			count: ii.count,
		}))) as Inventory;
	},
	({
		combined: function(other: Inventory): Inventory {
			return other.reduce<Inventory>(
				(prev, curr) => curr.typeId === 'TgoId'
					? [
						...prev,
						{ typeId: 'TgoId' as TypeId, tgoId: curr.tgoId, count: curr.count }
					]
					: prev.find(ii => ii.typeId === curr.typeId)
						? [
							...(prev.filter(ii => ii.typeId !== curr.typeId)),
							{
								...(prev.find(ii => ii.typeId === curr.typeId)!), 
								count: (prev.find(ii => ii.typeId === curr.typeId)?.count ?? 0) + curr.count }
						]
						: [
							...prev,
							{ ...curr }
						],
				[] as Inventory
			);
		},
		negated: function(other: Inventory): Inventory {
			return other.map(
				(ii) => ({
					...ii,
					count: ii.count * -1,
				})
			);
		},
		zeroCountsRemoved: function(other: Inventory): Inventory {
			return other.filter(ii => ii.count !== 0);
		},
		zeroOrLessCountsRemoved: function(other: Inventory): Inventory {
			return other.filter(ii => ii.count > 0);
		},
	})
);


// Component

export type ComponentInventory = TgoRoot & {
	readonly inventory: Inventory,
	readonly inventoryIsStorableOnly: boolean, // Whether only item types with isStorable: true can be stored in this inventory.
	readonly inventoryIsPhysical: boolean, // Whether items represent actual in-game items, storable or not. Non-physical inventories are for counting and allow negative counts.
};

export const hasComponentInventory = <BaseT extends TgoType>(tgo?: BaseT) : tgo is (BaseT & Required<ComponentInventory>) =>
	(tgo !== undefined) && typeof tgo.inventory !== undefined && Array.isArray(tgo.inventory);
