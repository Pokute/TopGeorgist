import { AnyAction } from "redux";
import { getType, ActionType, createAction } from "typesafe-actions";

import { Inventory } from "../components/inventory";
import { TgoId } from "../reducers/tgo";
import { MapPosition } from "../reducers/map";
import { TypeId } from "../reducers/itemType";
import { ComponentGoalDoer } from "../data/components_new";

export type RequirementDeliveryTargetTgoId = TgoId;
export type RequirementDeliveryTargetPosition = MapPosition;

export type RequirementDeliveryTarget = RequirementDeliveryTargetPosition | RequirementDeliveryTargetTgoId;

export type RequirementBase<T extends 'RequirementInventoryItems'> = {
	readonly type: T;
};

// export type RequirementIntentoryItems = RequirementBase<'RequirementInventoryItems'> & {
// 	readonly inventoryItems: Inventory,
// };

export type RequirementIntentoryItems = RequirementBase<'RequirementInventoryItems'> & {
	readonly inventoryItems: Inventory,
};

export type Requirement =
	RequirementIntentoryItems // We need to acquire items to complete
;

export type Goal = {
	readonly title?: string,
	readonly requirements: ReadonlyArray<Requirement>,
	readonly workTgoIds: ReadonlyArray<TgoId>,
};

export const addWork = createAction('GOAL_ADD_WORK',
	(tgoId: TgoId, workTgoId: TgoId) => ({
		tgoId,
		workTgoId,
	})
)();

export const removeWork = createAction('GOAL_REMOVE_WORK',
	(tgoId: TgoId, workTgoId: TgoId) => ({
		tgoId,
		workTgoId,
	})
)();

export const setWorkTargetTgoId = createAction('GOAL_SET_TARGET_TGO_ID',
	(tgoId: TgoId, workTargetTgoId: TgoId) => ({
		tgoId,
		workTargetTgoId,
	})
)();

export const goalActionList = {
	addWork,
	removeWork,
	setWorkTargetTgoId,
} as const;
export type GoalActionType = ActionType<typeof goalActionList[keyof typeof goalActionList]>;

export const goalReducer = (state: Goal, action: GoalActionType): Goal => {
	switch (action.type) {
		case getType(addWork):
			return {
				...state,
				// workTgoIds: [...state.workTgoIds, action.payload.workTgoId]
			};
		case getType(removeWork):
			return {
				...state,
				// workTgoIds: state.workTgoIds.filter(wi => wi !== action.payload.workTgoId),
			};
		default:
			return state;
	}
};

export type GoalTgosType = ReadonlyArray<TgoId>;

export const addGoals = createAction('TGO_GOALS_ADD',
	(tgoId: TgoId, goals: GoalTgosType) => ({
		tgoId,
		goals,
	})
)();

export const removeGoals = createAction('TGO_GOALS_REMOVE',
	(tgoId: TgoId, goals: GoalTgosType) => ({
		tgoId,
		goals,
	})
)();

export const goalDoerActionList = {
	addGoals,
	removeGoals,
} as const;
export type GoalDoerActionType = ActionType<typeof goalDoerActionList[keyof typeof goalDoerActionList]>;

export const goalDoerReducer = (state: ComponentGoalDoer['activeGoals'], action: GoalDoerActionType): ComponentGoalDoer['activeGoals'] => {
	switch (action.type) {
		case (getType(addGoals)):
			console.log('adding to goal queue: ', action.payload)
			return [
				...state,
				...action.payload.goals,
			];
		case (getType(removeGoals)):
			return state.filter(goal => !action.payload.goals.includes(goal));
		default:
			return state;
	}
}

export const createGoal = createAction('GOAL/CREATE',
	(tgoId: TgoId, goal: Goal) => ({
		tgoId,
		goal,
	})
)();
