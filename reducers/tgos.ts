import { ActionType, getType, isOfType, isActionOf } from 'typesafe-actions';

import playerReducer, { initialState as playerInitialState, PlayerActionType } from './player';
import tgoReducer, { initialState as tgoInitialState, TgoType, TgoActionType } from './tgo';
import goalsReducer, { GoalsActionType, GoalsActionList } from './goals';
import * as taskQueueActions from '../actions/taskQueue'; 
import * as inventoryActions from '../actions/inventory'; 
import * as goalsActions from '../actions/goals'; 
import * as tgoActions from '../actions/tgo'; 
import * as tgosActions from '../actions/tgos'; 
import { InventoryActionType } from './inventory';
import { hasComponentPlayer } from '../components_new';

export type TgosState = {
	readonly [extraProps: string]: TgoType;
};

const initialState: TgosState = {};

type TgosAction = ActionType<typeof tgosActions>;

const singleTgoReducer = (state: TgosState = initialState, action: TgoActionType | PlayerActionType | InventoryActionType): TgosState => {
	return state;
}

export default (state: TgosState = initialState, action: TgosAction | TgoActionType | PlayerActionType | InventoryActionType): TgosState => {
	if (isActionOf(tgoActions.setColor, action)) {
		return singleTgoReducer(state, action);
	}
	switch (action.type) {
		case getType(tgosActions.add):
			return {
				...state,
				[action.payload.tgo.tgoId]: {
					...(hasComponentPlayer(action.payload.tgo) ? playerInitialState : {}),
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
			if (isActionOf(tgoActions.setMoveTarget, action)
				|| isActionOf(tgoActions.setColor, action)
				|| isActionOf(tgoActions.setPosition, action)
				|| isActionOf(inventoryActions.add, action)
				|| isActionOf(taskQueueActions.addTaskQueue, action)
				|| isActionOf(taskQueueActions.setTaskQueue, action)
				|| isActionOf(goalsActions.addGoals, action)
				|| isActionOf(goalsActions.setGoals, action)
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
