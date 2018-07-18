import { ActionType, getType } from 'typesafe-actions';

import { TypeId } from "./itemType";
import * as inventoryActions from '../actions/inventory'

export interface InventoryItem {
	typeId: TypeId,
	count: number,
};

const initialState: ReadonlyArray<InventoryItem> = [];

export type InventoryActionType = ActionType<typeof inventoryActions>;
export const InventoryActionList = [
	inventoryActions.add,
];

export default (state: ReadonlyArray<InventoryItem> = initialState, action: InventoryActionType): ReadonlyArray<InventoryItem> => {
	switch (action.type) {
		case getType(inventoryActions.add): {
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
		default:
			return state;
	}
};
