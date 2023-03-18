import { AnyAction } from 'redux';
import { getType, ActionType, createAction } from 'typesafe-actions';

import { ComponentInventory, hasComponentInventory, Inventory, InventoryItem } from './inventory.js';
import { TgoId, TgoRoot, TgoType } from '../reducers/tgo.js';
import { MapPosition, mapPosition } from '../concerns/map.js';
import { createTupleFilter } from '../concerns/tgos.js';
import { TypeId } from '../reducers/itemType.js';
import { RootStateType } from '../reducers/index.js';
import { hasComponentPosition } from '../components/position.js';
import { ComponentWorkDoer, createWork, hasComponentWorkDoer, isComponentWork, workCreatorReducer, workWithCompletionsReducer } from './work.js';
import { TgosState } from '../reducers/tgos.js';

export type ComponentGoal = 
	TgoRoot & {
		readonly goal: Goal,
	};

export const isComponentGoal = <BaseT extends TgoType | ComponentGoal>(tgo: BaseT) : tgo is (BaseT & Required<ComponentGoal>) =>
	tgo && typeof tgo.goal !== 'undefined';

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

// export type RequirementIntentoryItems = RequirementBase<'RequirementInventoryItems'> & {
// 	readonly inventoryItems: Inventory,
// };

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

type TgoInventoryItem = Required<Pick<InventoryItem, 'tgoId'>>;
type TgoIds = ReadonlyArray<TgoInventoryItem>;
const inventoryTgoIds = (tgo: ComponentInventory): TgoIds =>
	tgo.inventory.filter(ii => ii.tgoId) as TgoIds;

const goalDoerTickReducer = (
	tgosState: RootStateType['tgos'],
	itemTypesState: RootStateType['itemTypes'],
	goalDoer: ComponentGoalDoer & ComponentWorkDoer & ComponentInventory
): RootStateType['tgos'] => {
	// Create autorun works that don't exist.

	const getInventoryTgoIds2 = (tgos: RootStateType['tgos'], tgo: ComponentInventory) =>
		inventoryTgoIds(tgo).map(ii => tgos[ii.tgoId]);

	const [currentGoalTgoId, ...restGoals] = goalDoer.activeGoals;
	if (!currentGoalTgoId) return tgosState;

	const currentGoalTgo = tgosState[currentGoalTgoId];
	const currentGoal = currentGoalTgo.goal;
	if (!currentGoal) {
		throw new Error('tgo.goal is undefined for a goal Tgo!');
	}

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

	const tgosStateWithoutGoalInInventory = (tgosState: TgosState, goalTgoToRemove: TgoId): TgosState =>
		Object.fromEntries([
			...Object.entries(tgosState)
				.filter(([tgoId]) => tgoId !== goalTgoToRemove),
			...Object.entries(tgosState)
				.filter(createTupleFilter(hasComponentInventory))
				.filter(([tgoId, tgo]) => tgo.inventory.filter(ii => ii.tgoId == goalTgoToRemove))
				.map(([tgoId, tgo]) => [tgoId, ({
					...tgo,
					inventory: tgo.inventory.filter(ii => ii.tgoId !== goalTgoToRemove)
				})])
		]);

	const tgosStateWithoutActiveGoal = (tgosState: TgosState, goalTgoToRemove: TgoId): TgosState => ({
		...tgosState,
		...(Object.fromEntries(
				Object.entries(tgosState)
					.filter(createTupleFilter(hasComponentGoalDoer))
					.filter(([tgoId, tgo]) => tgo.activeGoals.filter(goalTgoId => goalTgoId == goalTgoToRemove))
					.map(([tgoId, tgo]) => [tgoId, ({
						...tgo,
						activeGoals: tgo.activeGoals.filter(goalTgoId => goalTgoId !== goalTgoToRemove)
					})])
			)
		)
	});

	const removeGoal = (tgosState: TgosState, goalTgoToRemove: TgoId): TgosState =>
		tgosStateWithoutGoalInInventory(
			tgosStateWithoutActiveGoal(tgosState, goalTgoToRemove),
			goalTgoToRemove
		);

	if (currentGoal.requirements.every(requirementCompleted)) {
		return removeGoal(tgosState, currentGoalTgoId);
	}

	// TODO: Find out resources needed to complete requirements and try to create works that would fulfill those requirements.
	// 			For move goal, the resources would be 'movementAmount' items.

	const tgosAfterAutoRecipeCreate = goalDoer.recipeInfos
		.filter(recipeInfo =>
			recipeInfo.autoRun
			|| (currentGoal.requirements.some((req) => req.type === 'RequirementMove') && recipeInfo.recipe.output.some(output => output.typeId === 'movementAmount'))
		)
		.map(({recipe}) => recipe)
		.reduce(
			(currentTgosState, autoRecipe) => {
				const owner = currentTgosState[goalDoer.tgoId];
				if (owner && hasComponentInventory(owner)) {
					if (!getInventoryTgoIds2(currentTgosState, owner)
						.filter(isComponentWork)
						.some(work => work.workRecipe.type === autoRecipe.type))
						{
							return workCreatorReducer(currentTgosState, createWork({
								recipe: autoRecipe,
								workerTgoId: goalDoer.tgoId,
								inputInventoryTgoIds: [ goalDoer.tgoId ],
								outputInventoryTgoId: goalDoer.tgoId,
							}))[0];
						}
				}
				return currentTgosState;
			},
			tgosState
		);

	{
		const workDoer2 = tgosAfterAutoRecipeCreate[goalDoer.tgoId];
		if (!hasComponentInventory(workDoer2) || !hasComponentWorkDoer(workDoer2)) {
			return tgosState;
		}
	
		return tgosAfterAutoRecipeCreate;
		/*
		const works = getInventoryTgoIds2(tgosAfterAutoRecipeCreate, workDoer2)
			.filter(isComponentWork);

		const afterWorksTgosState = works.reduce(
			(currentTgosState, work) => workWithCompletionsReducer(currentTgosState, itemTypesState, workDoer2.tgoId, work.tgoId),
			tgosAfterAutoRecipeCreate
		);

		return afterWorksTgosState;
		*/
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
