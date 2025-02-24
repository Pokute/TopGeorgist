import { AnyAction } from 'redux';
import { getType, ActionType, createAction } from 'typesafe-actions';

import { ComponentInventory, hasComponentInventory, inventory, Inventory, InventoryItem } from './inventory.js';
import { TgoId, TgoRoot, TgoType } from '../reducers/tgo.js';
import { MapPosition, mapPosition } from '../concerns/map.js';
import { createTupleFilter } from '../concerns/tgos.js';
import { TypeId } from '../reducers/itemType.js';
import { RootStateType } from '../reducers/index.js';
import { hasComponentPosition } from '../components/position.js';
import { cleanupWorkIssuerInside, ComponentWorkDoer, ComponentWorkIssuer, hasComponentWorkDoer, workIssuerCreateWorksOnRequiredItems, workIssuerGetCommittedItems } from './work.js';
import { TgosState } from '../reducers/tgos.js';

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

export type RequirementDeliveryTargetTgoId = TgoId;
export type RequirementDeliveryTargetPosition = MapPosition;

export type RequirementDeliveryTarget = RequirementDeliveryTargetPosition | RequirementDeliveryTargetTgoId;

export type RequirementBase<T extends string> = {
	readonly type: T;
};

export type RequirementIntentoryItems = RequirementBase<'RequirementInventoryItems'> & {
	readonly inventoryItems: Inventory,
};

export type RequirementMove = RequirementBase<'RequirementMove'> & {
	targetPosition: MapPosition,
}

export type Requirement =
	| RequirementIntentoryItems // We need to acquire items to complete
	| RequirementMove
;

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

	const removeGoal = (tgosState: TgosState, goalTgoToRemove: ComponentGoal): TgosState =>
		tgosStateWithoutGoalInInventory(
			tgosStateWithoutActiveGoal(tgosState, goalTgoToRemove),
			goalTgoToRemove
		);

	return removeGoal(afterWorkIssuerCleanup, goalTgo);
};

const goalDoerTickReducer = (
	tgosState: TgosState,
	itemTypesState: RootStateType['itemTypes'],
	goalDoer: ComponentGoalDoer & ComponentWorkDoer & ComponentInventory
): TgosState => {
	// Create autorun works that don't exist.

	const getInventoryTgoIds2 = (tgos: RootStateType['tgos'], tgo: ComponentInventory) =>
		inventoryTgoIds(tgo).map(ii => tgos[ii.tgoId]);

	const [currentGoalTgoId, ...restGoals] = goalDoer.activeGoals;
	if (!currentGoalTgoId) return tgosState;

	const currentGoalTgo = tgosState[currentGoalTgoId];
	if (!isComponentGoal(currentGoalTgo)) {
		throw new Error('currentGoalTgo is not a goal Tgo!');
	}
	const currentGoal = currentGoalTgo.goal;
	if (!currentGoal) {
		throw new Error('tgo.goal is undefined for a goal Tgo!');
	}
	if (currentGoal.goalPaused)
		return tgosState;

	const requirementCompleted = (requirement: Requirement) => {
		switch (requirement.type) {
			case 'RequirementInventoryItems':
				return false;
			case 'RequirementMove': {
				if (!hasComponentPosition(goalDoer)) return false;
				return (mapPosition.matching(goalDoer.position, requirement.targetPosition));
			}
			default:
				false;
		}
	};

	if (currentGoal.requirements.every(requirementCompleted)) {
		return cleanupGoal(tgosState, currentGoalTgo);
	}

	const getRequirementItems = (requirement: Requirement): Inventory =>
		requirement.type === 'RequirementInventoryItems'
			? requirement.inventoryItems
			: requirement.type === 'RequirementMove'
				? [{ typeId: 'movementAmount' as TypeId, count: 1 }]
				: [];

	const requiredItems = currentGoal.requirements
		.map(getRequirementItems)
		.flat(1);

		
	const committedItems = workIssuerGetCommittedItems(tgosState, currentGoalTgo);
	
	const missingInput = inventory.zeroCountsRemoved(
		inventory.combined([
			...requiredItems,
			...inventory.negated(committedItems)
	]));

	const tgosAfterAutoRecipeCreate = workIssuerCreateWorksOnRequiredItems(tgosState, currentGoalTgo.tgoId, missingInput, goalDoer.tgoId/*, goalDoer.tgoId*/);

	{
		const workDoer2 = tgosAfterAutoRecipeCreate[goalDoer.tgoId];
		if (!hasComponentInventory(workDoer2) || !hasComponentWorkDoer(workDoer2)) {
			return tgosState;
		}

		return tgosAfterAutoRecipeCreate;
	}
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
