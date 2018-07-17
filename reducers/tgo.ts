import { ActionType, getType } from 'typesafe-actions';

import * as tgoActions from '../actions/tgo'; 
import * as inventoryActions from '../actions/inventory'; 
import inventoryReducer from './inventory';
import taskQueueReducer from './taskQueue';
import { TypeId } from './itemType';
import { TgosState } from './tgos';
import taskQueue from './taskQueue';
import * as taskQueueActions from '../actions/taskQueue';

type TgoAction = ActionType<typeof tgoActions>

export type TgoId = keyof TgosState;

export interface TgoInitialType {
	readonly position: {
		readonly x: number,
		readonly y: number,
	},
	readonly color: string,
	readonly renderer?: any,
	readonly typeId: TypeId,
	[extraProp: string]: any,
};

export interface TgoType extends TgoInitialType {
	readonly tgoId: TgoId,
};

export const initialState:TgoType = {
	tgoId: '',
	position: {
		x: 0,
		y: 0,
	},
	color: 'red',
	renderer: undefined,
	typeId: '',
};

const taskQueueActionsList = [
	taskQueueActions.addTaskQueue,
	taskQueueActions.setTaskQueue,
].map(a => getType(a));

export default (state: TgoType, action: TgoAction) : TgoType => {
	// Handle single view changes here.
	if (taskQueueActionsList.some(a => a === action.type)) {
		return {
			...state,
			taskQueue: taskQueueReducer(state.taskQueue, action),
		};
	}

	switch (action.type) {
		case getType(tgoActions.setPosition):
			return {
				...state,
				position: action.payload.position,
			};
		case getType(tgoActions.setColor):
			return {
				...state,
				color: action.payload.color,
			};
		// case getType(inventoryActions.add):
		// 	return {
		// 		...state,
		// 		inventory: inventoryReducer(state.inventory, action),
		// 	};
		default:
			return state;
	}
};
