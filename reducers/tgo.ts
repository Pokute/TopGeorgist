import { ActionType, getType } from 'typesafe-actions';

import * as tgoActions from '../actions/tgo'; 
import inventoryReducer, { InventoryActionList, InventoryActionType, InventoryItem } from './inventory';
import taskQueueReducer, { TaskQueueActionList, TaskQueueActionType, TaskQueueType } from './taskQueue';
import { TypeId } from './itemType';
import { TgosState } from './tgos';
import { ComponentList, Action } from '../components';
import { ComponentPosition, ComponentMoveTarget, ComponentRentOffice, ComponentGovernmentBuilding, ComponentLeaderBoard, ComponentMapGridOccipier, ComponentPlayer, ComponentVisitable, ComponentLabel, ComponentInventory, ComponentTaskQueue, ComponentPresentation, ComponentComponents } from '../components_new';

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

export type TgoPartials = (Partial<ComponentPosition>
	& Partial<ComponentMoveTarget> // Removeme
	& Partial<ComponentRentOffice>
	& Partial<ComponentGovernmentBuilding>
	& Partial<ComponentLeaderBoard>
	& Partial<ComponentMapGridOccipier>
	& Partial<ComponentPlayer>
	& Partial<ComponentVisitable>
	& Partial<ComponentLabel>
	& Partial<ComponentInventory>
	& Partial<ComponentTaskQueue>
	& Partial<ComponentPresentation>
	& Partial<ComponentComponents>
);

export type TgoType = TgoPartials & {
	readonly tgoId: TgoId,
};

export const initialState:TgoType = {
	tgoId: '',
	position: {
		x: 0,
		y: 0,
	},
	presentation: {
		color: 'red',
	},
};

export default (state: TgoType, action: TgoActionType | InventoryActionType | TaskQueueActionType) : TgoType => {
	switch (action.type) {
		case getType(tgoActions.setMoveTarget):
			return {
				...state,
				moveTarget: action.payload.position,
			};
		case getType(tgoActions.setPosition):
			return {
				...state,
				position: action.payload.position,
			};
		case getType(tgoActions.setColor):
			return {
				...state,
				presentation: { ...state.presentation, color: action.payload.color },
			};
		default: {
			let usedState = state;
			const newInventory = inventoryReducer(state.inventory, action as InventoryActionType);
			if (newInventory !== usedState.inventory) usedState = { ...usedState, inventory: newInventory };
			const newTaskQueue = taskQueueReducer(state.taskQueue, action as TaskQueueActionType);
			if (newTaskQueue !== usedState.taskQueue) usedState = { ...usedState, taskQueue: newTaskQueue };

			return usedState;
		}
	}
};
