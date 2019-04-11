import { ActionType, getType } from 'typesafe-actions';

import { TypeId } from "./itemType";
import { TgoId } from './tgo';
import * as inventoryActions from '../actions/inventory'

export interface InventoryItem {
	readonly typeId: TypeId,
	readonly count: number,
	readonly tgoId? : TgoId,
};

export type Inventory = ReadonlyArray<InventoryItem>;

const initialState: Inventory = [];

export type InventoryActionType = ActionType<typeof inventoryActions>;
export const InventoryActionList = [
	inventoryActions.add,
];

export default (state: Inventory = initialState, action: InventoryActionType): Inventory => {
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
		case getType(inventoryActions.addTgoId): {
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
