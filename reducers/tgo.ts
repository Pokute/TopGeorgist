import { ActionType, getType } from 'typesafe-actions';

import * as tgoActions from '../actions/tgo'; 
import inventoryReducer, { InventoryActionList, InventoryActionType, InventoryItem } from './inventory';
import taskQueueReducer, { TaskQueueActionList, TaskQueueActionType } from './taskQueue';
import { TypeId } from './itemType';
import { TgosState } from './tgos';
import { ComponentList } from '../components';

export type TgoActionType = ActionType<typeof tgoActions>
const TgoOwnActionList = [
	tgoActions.setColor,
	tgoActions.setPosition,
];
const TgoOtherReducers = [
	{ reducer: inventoryReducer, actions: InventoryActionList },
	{ reducer: taskQueueReducer, actions: TaskQueueActionList },
];
const TgoOthersActionList = TgoOtherReducers.reduce((actions: any[], reducer) => [ ...actions, ...reducer.actions ], []);
export const TgoActionList = [
	...TgoOwnActionList,
	...TgoOthersActionList,
];

export type TgoId = keyof TgosState;

export type ComponentId = keyof ComponentList;
export type ComponentProps = {
	readonly [extraProp: string]: any,
};
export type ComponentType = ComponentId | [ ComponentId, ComponentProps ];

export interface TgoInitialType {
	readonly position: {
		readonly x: number,
		readonly y: number,
	},
	readonly color: string,
	readonly renderer?: any,
	readonly typeId: TypeId,
	readonly inventory?: ReadonlyArray<InventoryItem>,
	readonly components?: ReadonlyArray<ComponentType>,
	readonly [extraProp: string]: any,
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

export default (state: TgoType, action: TgoActionType | InventoryActionType | TaskQueueActionType) : TgoType => {
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
		default: {
			let usedState = state;
			const newInventory = state.inventory ? inventoryReducer(state.inventory, action as InventoryActionType) : undefined;
			if (newInventory !== usedState.inventory) usedState = { ...usedState, newInventory };
			const newTaskQueue = state.taskQueue ? taskQueueReducer(state.taskQueue, action as TaskQueueActionType) : undefined;
			if (newTaskQueue !== usedState.taskQueue) usedState = { ...usedState, newInventory };

			return usedState;
		}
	}
};
