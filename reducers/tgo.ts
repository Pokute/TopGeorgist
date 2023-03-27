import { ActionType, getType } from 'typesafe-actions';
import { Opaque } from '../typings/global.d.js';

import * as tgoActions from '../actions/tgo.js'; 
import taskQueueReducer, { TaskQueueActionList, TaskQueueActionType } from './taskQueue.js';
import { goalDoerReducer, GoalDoerActionType, goalDoerActionList, ComponentGoal, ComponentGoalDoer, hasComponentGoalDoer, isComponentGoal } from '../concerns/goal.js';
import { goalReducer } from '../concerns/goal.js';
import { /* reducer as workReducer, */ WorkActionType, ComponentWork, ComponentWorkDoer } from '../concerns/work.js';
import { ComponentRentOffice, ComponentGovernmentBuilding, ComponentLeaderBoard, ComponentMapGridOccipier, ComponentVisitable, ComponentTaskQueue, ComponentPresentation, ComponentComponents } from '../data/components_new.js';
import { reducer as inventoryReducer, ComponentInventory, InventoryActionList, InventoryActionType } from '../concerns/inventory.js';
import { setPosition, ComponentPosition, PositionActionType, reducer as positionReducer, hasComponentPosition } from '../components/position.js';
import { ComponentPlayer } from '../components/player.js';
import { ComponentLabel } from '../components/label.js';
import { ComponentUniqueLabel } from '../components/uniqueLabel.js';
import { ComponentConsumer } from '../concerns/consumer.js'
import { GoalActionType } from '../concerns/goal.js';
import { ComponentDeployable } from '../concerns/deployable.js';

export type TgoActionType = ActionType<typeof tgoActions>
const TgoOwnActionList = [
	tgoActions.setColor,
	setPosition,
];
const TgoOtherReducers = [
	{ reducer: inventoryReducer, actions: InventoryActionList },
	{ reducer: taskQueueReducer, actions: TaskQueueActionList },
	{ reducer: goalDoerReducer, actions: Object.values(goalDoerActionList) },
];
const TgoOthersActionList = TgoOtherReducers.reduce((actions: ReadonlyArray<any>, reducer) => [ ...actions, ...reducer.actions ], []);
export const TgoActionList = [
	...TgoOwnActionList,
	...TgoOthersActionList,
];

export type TgoId = Opaque<string, 'TgoId'>;

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
	& Partial<ComponentConsumer>
	& Partial<ComponentDeployable>
);

export interface TgoRoot {
	readonly tgoId: TgoId,
};

export type TgoType = TgoRoot & TgoPartials;

export const initialState:TgoType = {
	tgoId: '' as TgoId,
	// TODO: Remove below
	presentation: {
		color: 'red',
	},
};

export default (state: TgoType, action: PositionActionType | TgoActionType | InventoryActionType | TaskQueueActionType | GoalDoerActionType | GoalActionType | WorkActionType) : TgoType => {
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
				const newGoals = goalDoerReducer(state.activeGoals, action as GoalDoerActionType);
				if (newGoals !== usedState.activeGoals) usedState = { ...usedState, activeGoals: newGoals };
			}
			if (isComponentGoal(state)) {
				const newGoal = goalReducer(state.goal, action as GoalActionType);
				if (newGoal !== usedState.goal) usedState = { ...usedState, goal: newGoal };
			}
			// if (isComponentWork(state)) {
			// 	const newWork = workReducer(state.work, action as WorkActionType);
			// 	if (newWork !== usedState.work) usedState = { ...usedState, work: newWork };
			// }
			return usedState;
		}
	}
};
