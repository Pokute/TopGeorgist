import { type ActionType, getType } from 'typesafe-actions';
import type { Opaque } from '../typings/global.d.ts';

import * as tgoActions from '../actions/tgo.ts'; 
import { goalDoerReducer, type GoalDoerActionType, goalDoerActionList, type ComponentGoal, type ComponentGoalDoer, hasComponentGoalDoer, isComponentGoal } from '../concerns/goal.ts';
import { goalReducer } from '../concerns/goal.ts';
import { type WorkActionType, type ComponentWork, type ComponentWorkDoer, type ComponentWorkIssuer } from '../concerns/work.ts';
import { type ComponentRentOffice, type ComponentGovernmentBuilding, type ComponentStatsBoard, type ComponentMapGridOccipier, type ComponentVisitable, type ComponentPresentation } from '../data/components_new.ts';
import { reducer as inventoryReducer, type ComponentInventory, InventoryActionList, type InventoryActionType } from '../concerns/inventory.ts';
import { setPosition, type ComponentPosition, type PositionActionType, reducer as positionReducer, hasComponentPosition } from '../components/position.ts';
import { type ComponentPlayer } from '../components/player.ts';
import { type ComponentLabel } from '../components/label.ts';
import { type ComponentUniqueLabel } from '../components/uniqueLabel.ts';
import { type ComponentConsumer } from '../concerns/consumer.ts'
import { type GoalActionType } from '../concerns/goal.ts';
import { type ComponentDeployable } from '../concerns/deployable.ts';

export type TgoActionType = ActionType<typeof tgoActions>
const TgoOwnActionList = [
	tgoActions.setColor,
	setPosition,
];
const TgoOtherReducers = [
	{ reducer: inventoryReducer, actions: InventoryActionList },
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
	& Partial<ComponentStatsBoard>
	& Partial<ComponentMapGridOccipier>
	& Partial<ComponentPlayer>
	& Partial<ComponentVisitable>
	& Partial<ComponentLabel>
	& Partial<ComponentUniqueLabel>
	& Partial<ComponentInventory>
	& Partial<ComponentPresentation>
	& Partial<ComponentGoal>
	& Partial<ComponentWork>
	& Partial<ComponentGoalDoer>
	& Partial<ComponentWorkDoer>
	& Partial<ComponentWorkIssuer>
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

export default (state: TgoType, action: PositionActionType | TgoActionType | InventoryActionType | GoalDoerActionType | GoalActionType | WorkActionType) : TgoType => {
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
			if (hasComponentGoalDoer(state)) {
				const newGoals = goalDoerReducer(state.activeGoals, action as GoalDoerActionType);
				if (newGoals !== usedState.activeGoals) usedState = { ...usedState, activeGoals: newGoals };
			}
			if (isComponentGoal(state)) {
				usedState = goalReducer(state, action as GoalActionType);
			}
			return usedState;
		}
	}
};
