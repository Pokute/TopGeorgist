import { ActionType, getType, isOfType, isActionOf } from 'typesafe-actions';

import tgoReducer, { initialState as tgoInitialState, TgoType, TgoActionType, TgoId } from './tgo.js';
import { GoalActionType, GoalDoerActionType, goalDoerActionList } from '../concerns/goal.js';
import * as tgoActions from '../actions/tgo.js'; 
import * as tgosActions from '../actions/tgos.js'; 
import { InventoryActionType } from '../concerns/inventory.js';
import { inventoryActions, hasComponentInventory, reducer as inventoryReducer } from '../concerns/inventory.js';
import { setPosition, hasComponentPosition, reducer as positionReducer } from '../components/position.js';

export type TgosState = {
	readonly [tgoId: string]: TgoType;
};

const initialState: TgosState = {};

type TgosAction = ActionType<typeof tgosActions>;

const singleTgoReducer = (state: TgosState = initialState, action: TgoActionType | InventoryActionType): TgosState => {
	return state;
}

const componentReducers = [
	{
		test: hasComponentPosition,
		reducer: positionReducer,
	},
	{
		test: hasComponentInventory,
		reducer: inventoryReducer,
	},
];

export default (state: TgosState = initialState, action: TgosAction | TgoActionType | InventoryActionType | GoalActionType | GoalDoerActionType): TgosState => {
	if (isActionOf(tgoActions.setColor, action)) {
		return singleTgoReducer(state, action);
	}
	switch (action.type) {
		case getType(tgosActions.add):
			return {
				...state,
				[action.payload.tgo.tgoId]: {
					...tgoInitialState,
					...action.payload.tgo,
				},
			};
		case getType(tgosActions.remove): 
		{
			const { [action.payload.tgoId]: undefined, ...rest } = state;
			return rest;
		}
		case getType(tgosActions.setAll):
			return action.payload.tgos;
		default:
			if (isActionOf(setPosition, action)
				|| isActionOf(tgoActions.setColor, action)
				|| isActionOf(inventoryActions.add, action)
				|| isActionOf(inventoryActions.addTgoId, action)
				|| isActionOf(inventoryActions.removeTgoId, action)
				|| isActionOf(goalDoerActionList.addGoals, action)
				|| isActionOf(goalDoerActionList.removeGoals, action)
			) {
				const newTgoState = tgoReducer(state[action.payload.tgoId], action);
				if (newTgoState !== state[action.payload.tgoId]) {
					return {
						...state,
						[action.payload.tgoId]: newTgoState,
					};
				}
			}
		return state;
	}
};

export const getTgoByIdFromRootState = (tgos: TgosState) =>
	(tgoId: TgoId): TgoType | undefined =>
		tgos[tgoId];
