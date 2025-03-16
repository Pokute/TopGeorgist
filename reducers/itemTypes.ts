import { type ActionType, getType } from 'typesafe-actions';

import { type ItemType } from './itemType.ts';
import * as itemsTypeActions from '../actions/itemTypes.ts';

export type ItemTypesState = {
	[extraProps: string]: ItemType;
};
type f = keyof ItemTypesState;

const initialState: ItemTypesState = {};

type ItemTypesAction = ActionType<typeof itemsTypeActions>;

export default (state: ItemTypesState = initialState, action: ItemTypesAction): ItemTypesState => {
	switch (action.type) {
		case getType(itemsTypeActions.setAll):
			return action.payload.itemTypes;
		case getType(itemsTypeActions.add):
			if (Object.keys(state).includes(action.payload.itemType.typeId)) {
				console.warn(`Overrided item type ${action.payload.itemType.typeId}`);
			}
			return {
				...state,
				[action.payload.itemType.typeId]: action.payload.itemType,
			};
		case getType(itemsTypeActions.remove):
			const { [action.payload.typeId]: undefined, ...rest } = state;
			return rest;
		default:
			return state;
	}
};
