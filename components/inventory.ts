import { ActionType, getType, createAction } from "typesafe-actions";

import { TgoId, TgoType, TgoRoot } from "../reducers/tgo";
import { TypeId } from "../reducers/itemType";

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

export type ComponentInventory = TgoRoot & {
	readonly inventory: Inventory,
	readonly isInventoryVirtual?: boolean, // Allows having negative count of any type.
};

export const hasComponentInventory = <BaseT extends TgoType>(tgo: BaseT) : tgo is (BaseT & Required<ComponentInventory>) =>
	typeof tgo.inventory !== undefined && Array.isArray(tgo.inventory);
