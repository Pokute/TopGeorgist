import { ActionType, getType } from 'typesafe-actions';

import * as tgoActions from '../actions/tgo'; 
import taskQueueReducer, { TaskQueueActionList, TaskQueueActionType, TaskQueueType } from './taskQueue';
import goalsReducer, { GoalsActionType, GoalsActionList } from './goals';
import goalReducer from './goal';
import workInstanceReducer, { WorkInstanceActionType } from './workInstance';
import { TypeId } from './itemType';
import { TgosState } from './tgos';
import { ComponentList, Action } from '../components';
import { ComponentRentOffice, ComponentGovernmentBuilding, ComponentLeaderBoard, ComponentMapGridOccipier, ComponentVisitable, ComponentTaskQueue, ComponentPresentation, ComponentComponents, ComponentWork, ComponentGoal, ComponentGoalDoer, ComponentWorkDoer, hasComponentGoalDoer, isComponentWork, isComponentGoal } from '../components_new';
import { reducer as inventoryReducer, ComponentInventory, InventoryActionList, InventoryActionType, InventoryItem } from "../components/inventory";
import { setPosition, ComponentPosition, PositionActionType, reducer as positionReducer, hasComponentPosition } from '../components/position';
import { ComponentPlayer } from '../components/player';
import { ComponentLabel } from '../components/label';
import { ComponentUniqueLabel } from '../components/uniqueLabel';
import { GoalActionType } from './goal';

export type TgoActionType = ActionType<typeof tgoActions>
const TgoOwnActionList = [
	tgoActions.setColor,
	setPosition,
];
const TgoOtherReducers = [
	{ reducer: inventoryReducer, actions: InventoryActionList },
	{ reducer: taskQueueReducer, actions: TaskQueueActionList },
	{ reducer: goalsReducer, actions: GoalsActionList },
];
const TgoOthersActionList = TgoOtherReducers.reduce((actions: ReadonlyArray<any>, reducer) => [ ...actions, ...reducer.actions ], []);
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
	& Partial<ComponentRentOffice>
	& Partial<ComponentGovernmentBuilding>
	& Partial<ComponentLeaderBoard>
	& Partial<ComponentMapGridOccipier>
	& Partial<ComponentPlayer>
	& Partial<ComponentVisitable>
	& Partial<ComponentLabel>
	& Partial<ComponentUniqueLabel>
	& Partial<ComponentInventory>
	& Partial<ComponentTaskQueue>
	& Partial<ComponentPresentation>
	& Partial<ComponentComponents>
	& Partial<ComponentGoal>
	& Partial<ComponentWork>
	& Partial<ComponentGoalDoer>
	& Partial<ComponentWorkDoer>
);

export interface TgoRoot {
	readonly tgoId: TgoId,
};

export type TgoType = TgoRoot & TgoPartials;

export const initialState:TgoType = {
	tgoId: '',
	// TODO: Remove below
	presentation: {
		color: 'red',
	},
};

export default (state: TgoType, action: PositionActionType | TgoActionType | InventoryActionType | TaskQueueActionType | GoalsActionType | GoalActionType | WorkInstanceActionType) : TgoType => {
	switch (action.type) {
		case getType(tgoActions.setColor):
			return {
				...state,
				presentation: { ...state.presentation, color: action.payload.color },
			};
		default: {
			let usedState = state;
			if (hasComponentPosition(usedState)) {
				usedState = positionReducer(usedState, action as PositionActionType);
			}
			const newInventory = inventoryReducer(state.inventory, action as InventoryActionType);
			if (newInventory !== usedState.inventory) usedState = { ...usedState, inventory: newInventory };
			const newTaskQueue = taskQueueReducer(state.taskQueue, action as TaskQueueActionType);
			if (newTaskQueue !== usedState.taskQueue) usedState = { ...usedState, taskQueue: newTaskQueue };
			if (hasComponentGoalDoer(state)) {
				const newGoals = goalsReducer(state.activeGoals, action as GoalsActionType);
				if (newGoals !== usedState.activeGoals) usedState = { ...usedState, activeGoals: newGoals };
			}
			if (isComponentGoal(state)) {
				const newGoal = goalReducer(state.goal, action as GoalActionType);
				if (newGoal !== usedState.goal) usedState = { ...usedState, goal: newGoal };
			}
			// if (isComponentWork(state)) {
			// 	const newWorkInstance = workInstanceReducer(state.work, action as WorkInstanceActionType);
			// 	if (newWorkInstance !== usedState.work) usedState = { ...usedState, work: newWorkInstance };
			// }
			return usedState;
		}
	}
};
