import { ActionType, getType, createAction } from "typesafe-actions";

import { TgoId, TgoType } from "../reducers/tgo";
import { TypeId } from "../reducers/itemType";

export const add = createAction('TGO_INVENTORY_ADD', (resolve) => {
	return (ownerTgoId: TgoId, typeId: TypeId, count: number = 1) => resolve({
		tgoId: ownerTgoId,
		item: {
			typeId,
			count,
		},
	});
});

export const addTgoId = createAction('TGO_INVENTORY_ADD_TGO_ID', (resolve) => {
	return (ownerTgoId: TgoId, tgoId: TgoId) => resolve({
		tgoId: ownerTgoId,
		item: {
			tgoId,
		},
	});
});

export const inventoryActions = {
	add,
	addTgoId,
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
			return [
				...state,
				{
					typeId: 'tgoId',
					count: 1,
					tgoId: action.payload.item.tgoId,
				}
			];
		}
		default:
			return state;
	}
};

export interface ComponentInventory {
	readonly inventory: Inventory,
}

export const hasComponentInventory = <BaseT extends TgoType>(tgo: BaseT) : tgo is (BaseT & Required<ComponentInventory>) =>
	typeof tgo.inventory !== undefined
