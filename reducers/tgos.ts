import { ActionType, getType, isOfType, isActionOf } from 'typesafe-actions';

import tgoReducer, { initialState as tgoInitialState, TgoType, TgoActionType, TgoId } from './tgo';
import goalsReducer, { GoalsActionType, GoalsActionList } from './goals';
import * as taskQueueActions from '../actions/taskQueue'; 
import * as goalsActions from '../actions/goals'; 
import * as goalActions from '../actions/goal'; 
import * as workActions from '../actions/workInstance'; 
import * as tgoActions from '../actions/tgo'; 
import * as tgosActions from '../actions/tgos'; 
import { InventoryActionType } from '../components/inventory';
import { hasComponentPlayer } from '../components/player';
import { inventoryActions, hasComponentInventory, reducer as inventoryReducer } from '../components/inventory';
import { setPosition, hasComponentPosition, reducer as positionReducer, positionActions } from '../components/position';
import { GoalActionType } from './goal';

export type TgosState = {
	readonly [extraProps: string]: TgoType;
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

export default (state: TgosState = initialState, action: TgosAction | TgoActionType | InventoryActionType | GoalActionType | GoalsActionType): TgosState => {
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
				||isActionOf(tgoActions.setColor, action)
				|| isActionOf(inventoryActions.add, action)
				|| isActionOf(inventoryActions.addTgoId, action)
				|| isActionOf(taskQueueActions.addTaskQueue, action)
				|| isActionOf(taskQueueActions.setTaskQueue, action)
				|| isActionOf(goalsActions.addGoals, action)
				|| isActionOf(goalsActions.setGoals, action)
				|| isActionOf(goalsActions.removeGoals, action)
				|| isActionOf(goalActions.addWorkInstance, action)
				|| isActionOf(goalActions.removeWorkInstance, action)
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
