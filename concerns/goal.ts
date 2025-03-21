import { getType, type ActionType, createAction } from 'typesafe-actions';

import { type ComponentInventory, hasComponentInventory, inventory, type InventoryItem } from './inventory.ts';
import { type TgoId, type TgoRoot, type TgoType } from '../reducers/tgo.ts';
import { type TgosState, createTupleFilter } from '../concerns/tgos.ts';
import { type RootStateType } from '../reducers/index.ts';
import { cleanupWorkIssuerInside, type ComponentWorkDoer, type ComponentWorkIssuer, hasComponentWorkDoer } from './work.ts';
import { type Requirement, cleanupRequirement, getRequirementProducedItems, getRequirementItems, requirementIsCompleted, requirementWorkIssuer } from './requirements.ts';

export type ComponentGoal = 
	ComponentWorkIssuer & {
		readonly goal: Goal,
	};

export const isComponentGoal = <BaseT extends TgoType | ComponentGoal>(tgo?: BaseT) : tgo is (BaseT & Required<ComponentGoal>) =>
	(tgo !== undefined) && typeof tgo.goal !== 'undefined';

export type ComponentGoalDoer = 
	TgoRoot & {
		readonly activeGoals: ReadonlyArray<TgoId>,
	};

export const hasComponentGoalDoer = <BaseT extends TgoType>(tgo?: BaseT) : tgo is (BaseT & Required<ComponentGoalDoer>) =>
	(tgo !== undefined) && Array.isArray(tgo.activeGoals);

export type Goal = {
	readonly title?: string,
	readonly requirements: ReadonlyArray<Requirement>,
	readonly goalPaused?: boolean,
};

export const setWorkTargetTgoId = createAction('GOAL_SET_TARGET_TGO_ID',
	(tgoId: TgoId, workTargetTgoId: TgoId) => ({
		tgoId,
		workTargetTgoId,
	})
)();

export const cancelGoal = createAction('GOAL/CANCEL',
	(goalDoerTgoId: TgoId, goalTgoId: TgoId) => ({
		goalDoerTgoId,
		goalTgoId,
	})
)();

export const pauseGoal = createAction('GOAL/PAUSE',
	(goalDoerTgoId: TgoId, goalTgoId: TgoId) => ({
		goalDoerTgoId,
		goalTgoId,
	})
)();

export const resumeGoal = createAction('GOAL/RESUME',
	(goalDoerTgoId: TgoId, goalTgoId: TgoId) => ({
		goalDoerTgoId,
		goalTgoId,
	})
)();

export const goalActionList = {
	setWorkTargetTgoId,
	cancelGoal,
	pauseGoal,
	resumeGoal,
} as const;
export type GoalActionType = ActionType<typeof goalActionList[keyof typeof goalActionList]>;

export const goalReducer = (state: ComponentGoal, action: GoalActionType): ComponentGoal => {
	switch (action.type) {
		case getType(pauseGoal): {
			return {
				...state,
				goal: {
					...state.goal,
					goalPaused: true,
				},
			};
		}
		case getType(resumeGoal): {
			return {
				...state,
				goal: {
					...state.goal,
					goalPaused: false,
				},
			};
		}
		default:
			return state;
	}
};

export const goalCancelReducer = (state: TgosState, action: ActionType<typeof cancelGoal>): TgosState => {
	const goalTgo = state[action.payload.goalTgoId];
	if (!isComponentGoal(goalTgo))
		return state;
	return cleanupGoal(state, goalTgo);
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

type TgoInventoryItem = Required<Pick<InventoryItem, 'tgoId'>>;
type TgoIds = ReadonlyArray<TgoInventoryItem>;
const inventoryTgoIds = (tgo: ComponentInventory): TgoIds =>
	tgo.inventory.filter(ii => ii.tgoId) as TgoIds;

const cleanupGoal = (tgosState: TgosState, goalTgo: ComponentGoal): TgosState => {
	const afterWorkIssuerCleanup = cleanupWorkIssuerInside(tgosState, goalTgo);

	const tgosStateWithoutGoalInInventory = (tgosState: TgosState, goalTgoToRemove: ComponentGoal): TgosState =>
		Object.fromEntries([
			...Object.entries(tgosState)
				.filter(([tgoId]) => tgoId !== goalTgoToRemove.tgoId),
			...Object.entries(tgosState)
				.filter(createTupleFilter(hasComponentInventory))
				.filter(([tgoId, tgo]) => tgo.inventory.filter(ii => ii.tgoId == goalTgoToRemove.tgoId))
				.map(([tgoId, tgo]) => [tgoId, ({
					...tgo,
					inventory: tgo.inventory.filter(ii => ii.tgoId !== goalTgoToRemove.tgoId)
				})])
		]);

	const tgosStateWithoutActiveGoal = (tgosState: TgosState, goalTgoToRemove: ComponentGoal): TgosState => ({
		...tgosState,
		...(Object.fromEntries(
				Object.entries(tgosState)
					.filter(createTupleFilter(hasComponentGoalDoer))
					.filter(([tgoId, tgo]) => tgo.activeGoals.filter(goalTgoId => goalTgoId == goalTgoToRemove.tgoId))
					.map(([tgoId, tgo]) => [tgoId, ({
						...tgo,
						activeGoals: tgo.activeGoals.filter(goalTgoId => goalTgoId !== goalTgoToRemove.tgoId)
					})])
			)
		)
	});

	const tgosStateWithoutCountInventories = (tgosState: TgosState, goalTgoToRemove: ComponentGoal): TgosState =>
		goalTgoToRemove.goal.requirements
			.reduce((tgos, req) => cleanupRequirement(tgos, req), tgosState);

	const removeGoal = (tgosState: TgosState, goalTgoToRemove: ComponentGoal): TgosState =>
		tgosStateWithoutGoalInInventory(
			tgosStateWithoutActiveGoal(
				tgosStateWithoutCountInventories(tgosState, goalTgoToRemove)
				, goalTgoToRemove),
			goalTgoToRemove
		);

	return removeGoal(afterWorkIssuerCleanup, goalTgo);
};

const goalTickReducer = (
	tgosState: TgosState,
	itemTypesState: RootStateType['itemTypes'],
	goalTgo: ComponentGoal,
	goalDoer: ComponentGoalDoer & ComponentWorkDoer & ComponentInventory
): TgosState => {
	if (!isComponentGoal(goalTgo)) {
		throw new Error('currentGoalTgo is not a goal Tgo!');
	}
	const currentGoal = goalTgo.goal;
	if (currentGoal.goalPaused)
		return tgosState;

	if (currentGoal.requirements.every(req => requirementIsCompleted(tgosState, goalDoer, req))) {
		return cleanupGoal(tgosState, goalTgo);
	}

	const requiredItems = currentGoal.requirements
		.map(getRequirementItems)
		.flat(1);

	const committedItems = currentGoal.requirements
		.map(req => getRequirementProducedItems(tgosState, req, goalDoer))
		.flat(1);

	const missingInput = inventory.zeroOrLessCountsRemoved(
		inventory.combined([
			...requiredItems,
			...inventory.negated(committedItems)
	]));

	return requirementWorkIssuer(tgosState, currentGoal.requirements[0], missingInput, goalTgo, goalTgo, goalDoer);
}

const goalDoerTickReducer = (
	tgosState: TgosState,
	itemTypesState: RootStateType['itemTypes'],
	goalDoer: ComponentGoalDoer & ComponentWorkDoer & ComponentInventory
): TgosState => {
	const getInventoryTgoIds2 = (tgos: RootStateType['tgos'], tgo: ComponentInventory) =>
		inventoryTgoIds(tgo).map(ii => tgos[ii.tgoId]);

	return goalDoer.activeGoals
		.slice(0, 1) // Remove this line when multiple goals are supported.
		.reduce((tgos, goalTgoId) => {
			const goalTgo = tgos[goalTgoId];
			if (!isComponentGoal(goalTgo))
				return tgos;
			return goalTickReducer(tgos, itemTypesState, goalTgo, goalDoer);
		}, tgosState);
};

export const goalDoersTickReducer = (
	tgosState: RootStateType['tgos'],
	itemTypesState: RootStateType['itemTypes'],
): RootStateType['tgos'] => {
	const goalDoers = Object.values(tgosState)
		.filter(hasComponentGoalDoer)
		.filter(hasComponentWorkDoer)
		.filter(hasComponentInventory)
	
	return goalDoers.reduce(
		(tgos, goalDoer) => goalDoerTickReducer(tgos, itemTypesState, goalDoer),
		tgosState,
	)
};
