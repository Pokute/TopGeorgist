import { Action, ComponentTicker } from './components.js';
import { TgoType, ComponentType, TgoId, TgoRoot } from '../reducers/tgo.js';
import { TaskQueueType } from '../reducers/taskQueue.js';
import { Goal } from '../concerns/goal.js';
import { Recipe, RecipeId } from '../reducers/recipe.js';
import { ComponentPosition } from '../components/position.js';
import { Work } from '../concerns/work.js';

export type ComponentRentOffice = 
	ComponentPosition & {
	readonly rentOffice: true,
};

export const hasComponentRentOffice = <BaseT extends TgoType>(tgo: BaseT) : tgo is (BaseT & Required<ComponentRentOffice>) =>
	tgo && (tgo.rentOffice !== undefined && tgo.rentOffice === true);

export type ComponentGovernmentBuilding = 
	ComponentPosition & {
	readonly governmentBuilding: true,
};

export const hasComponentGovernmentBuilding = <BaseT extends TgoType>(tgo: BaseT) : tgo is (BaseT & Required<ComponentGovernmentBuilding>) =>
	tgo && (tgo.governmentBuilding !== undefined && tgo.governmentBuilding === true);

export type ComponentLeaderBoard = 
TgoRoot & {
	readonly leaderBoard: true,
};

export const hasComponentLeaderBoard = <BaseT extends TgoType>(tgo: BaseT) : tgo is (BaseT & Required<ComponentLeaderBoard>) =>
	tgo && (tgo.leaderBoard !== undefined && tgo.leaderBoard === true);

export type ComponentMapGridOccipier = 
TgoRoot &  {
	readonly mapGridOccupier: true,
};

export const hasComponentMapGridOccipier = <BaseT extends TgoType>(tgo: BaseT) : tgo is (BaseT & Required<ComponentMapGridOccipier>) =>
	tgo && (tgo.mapGridOccupier !== undefined && tgo.mapGridOccupier === true);

export type ComponentVisitable = 
TgoRoot & {
	readonly visitable?: {
		readonly label: string,
		readonly actions?: ReadonlyArray<Action>,
	},
};

export const hasComponentVisitable = <BaseT extends TgoType>(tgo: BaseT) : tgo is (BaseT & Required<ComponentVisitable>) =>
	tgo && (tgo.visitable !== undefined);

export type ComponentTaskQueue = 
TgoRoot & {
	readonly taskQueue: TaskQueueType,
};

export const hasComponentTaskQueue = <BaseT extends TgoType>(tgo: BaseT) : tgo is (BaseT & Required<ComponentTaskQueue>) =>
	tgo && typeof tgo.taskQueue !== 'undefined';

export type ComponentPresentation = 
TgoRoot & {
	readonly presentation: {
		readonly color: string
	},
};

export const hasComponentPresentation = <BaseT extends TgoType>(tgo: BaseT) : tgo is (BaseT & Required<ComponentPresentation>) =>
	tgo && typeof tgo.presentation !== 'undefined';

export type ComponentComponents = 
TgoRoot & {
	readonly components: ReadonlyArray<ComponentType>,
};

export const hasComponentComponents = <BaseT extends TgoType>(tgo: BaseT) : tgo is (BaseT & Required<ComponentComponents>) =>
	tgo && Array.isArray(tgo.components);

export type ComponentWork = 
TgoRoot & {
	// Actor is the tgo in whose inventory this work is.
	readonly workRecipe: Recipe,
	readonly workTargetTgoId?: TgoId,
	readonly workActorCommittedItemsTgoId?: TgoId, // Committed items are already removed from actor's inventory, but can be redeemed.
	readonly workTargetCommittedItemsTgoId?: TgoId, // Committed items are already removed from target's inventory, but can be redeemed.
};

export const isComponentWork = <BaseT extends TgoType | ComponentWork>(tgo: BaseT) : tgo is (BaseT & Required<ComponentWork>) =>
	tgo && typeof tgo.workRecipe !== 'undefined';

export type ComponentGoal = 
TgoRoot & {
	readonly goal: Goal,
};

export const isComponentGoal = <BaseT extends TgoType | ComponentGoal>(tgo: BaseT) : tgo is (BaseT & Required<ComponentGoal>) =>
	tgo && typeof tgo.goal !== 'undefined';

export type ComponentWorkDoer = 
TgoRoot & {
	// readonly recipeInfos: Record<RecipeId, {
	readonly recipeInfos: ReadonlyArray<{
		readonly recipe: Recipe,
		readonly autoRun: boolean,
//		readonly workProgress?: TgoId, // Tgo with inventory.
	}>,
};

export const hasComponentWorkDoer = <BaseT extends TgoType>(tgo: BaseT) : tgo is (BaseT & Required<ComponentWorkDoer>) =>
	tgo && (tgo.recipeInfos !== undefined)

export type ComponentGoalDoer = 
TgoRoot & {
	readonly activeGoals: ReadonlyArray<TgoId>,
};

export const hasComponentGoalDoer = <BaseT extends TgoType | ComponentGoalDoer>(tgo: BaseT) : tgo is (BaseT & Required<ComponentGoalDoer>) =>
	tgo && Array.isArray(tgo.activeGoals);
