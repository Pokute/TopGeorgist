import { Action } from "./components";
import { TgoType, ComponentType, TgoId, TgoRoot } from "../reducers/tgo";
import { TaskQueueType } from "../reducers/taskQueue";
import { Goal } from "../reducers/goal";
import { Work } from "../reducers/work";
import { ComponentPosition } from '../components/position';

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
	typeof tgo.taskQueue !== undefined;

export type ComponentPresentation = 
TgoRoot & {
	readonly presentation: {
		readonly color: string
	},
};

export const hasComponentPresentation = <BaseT extends TgoType>(tgo: BaseT) : tgo is (BaseT & Required<ComponentPresentation>) =>
	typeof tgo.presentation !== 'undefined';

export type ComponentComponents = 
TgoRoot & {
	readonly components: ReadonlyArray<ComponentType>,
};

export const hasComponentComponents = <BaseT extends TgoType>(tgo: BaseT) : tgo is (BaseT & Required<ComponentComponents>) =>
	Array.isArray(tgo.components);

export type ComponentWork = 
TgoRoot & {
	readonly work: Work,
	// readonly actorTgoId: TgoId,
	readonly workTargetTgoId?: TgoId,
	readonly workActorCommittedItemsTgoId?: TgoId, // Committed items are already removed from participant's inventory, but can be redeemed.
	readonly workTargetCommittedItemsTgoId?: TgoId, // Committed items are already removed from participant's inventory, but can be redeemed.
};

export const isComponentWork = <BaseT extends TgoType>(tgo: BaseT) : tgo is (BaseT & Required<ComponentWork>) =>
	typeof tgo.work !== undefined;

export type ComponentGoal = 
TgoRoot & {
	readonly goal: Goal,
};

export const isComponentGoal = <BaseT extends TgoType>(tgo: BaseT) : tgo is (BaseT & Required<ComponentGoal>) =>
	typeof tgo.goal !== undefined;

export type ComponentWorkDoer = 
TgoRoot & {
	readonly isWorkDoer: true,
};

export const hasComponentWorkDoer = <BaseT extends TgoType>(tgo: BaseT) : tgo is (BaseT & Required<ComponentWorkDoer>) =>
	tgo.isWorkDoer == true;

export type ComponentGoalDoer = 
TgoRoot & {
	readonly activeGoals: ReadonlyArray<TgoId>,
};

export const hasComponentGoalDoer = <BaseT extends TgoType>(tgo: BaseT) : tgo is (BaseT & Required<ComponentGoalDoer>) =>
	Array.isArray(tgo.activeGoals);
