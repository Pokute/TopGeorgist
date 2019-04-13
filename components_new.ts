import { Action } from "./components";
import { TgoType, ComponentType, TgoId } from "./reducers/tgo";
import { TaskQueueType } from "./reducers/taskQueue";
import { Goal } from "./reducers/goal";
import { MapPosition } from "./reducers/map";
import { Work } from "./reducers/work";
import { ComponentInventory } from "./components/inventory";

export interface ComponentPosition {
	readonly position: MapPosition,
};

export const hasComponentPosition = <BaseT extends TgoType>(tgo: BaseT) : tgo is (BaseT & Required<ComponentPosition>) =>
	tgo && (tgo.position !== undefined) && (tgo.position.x !== undefined) && (tgo.position.y != undefined);

export type ComponentRentOffice = 
	ComponentPosition & {
	readonly rentOffice: true,
}

export const hasComponentRentOffice = <BaseT extends TgoType>(tgo: BaseT) : tgo is (BaseT & Required<ComponentRentOffice>) =>
	tgo && (tgo.rentOffice !== undefined && tgo.rentOffice === true)

export type ComponentGovernmentBuilding = 
	ComponentPosition & {
	readonly governmentBuilding: true,
}

export const hasComponentGovernmentBuilding = <BaseT extends TgoType>(tgo: BaseT) : tgo is (BaseT & Required<ComponentGovernmentBuilding>) =>
	tgo && (tgo.governmentBuilding !== undefined && tgo.governmentBuilding === true)

export interface ComponentLeaderBoard {
	readonly leaderBoard: true,
}

export const hasComponentLeaderBoard = <BaseT extends TgoType>(tgo: BaseT) : tgo is (BaseT & Required<ComponentLeaderBoard>) =>
	tgo && (tgo.leaderBoard !== undefined && tgo.leaderBoard === true)

export interface ComponentMapGridOccipier {
	readonly mapGridOccupier: true,
}

export const hasComponentMapGridOccipier = <BaseT extends TgoType>(tgo: BaseT) : tgo is (BaseT & Required<ComponentMapGridOccipier>) =>
	tgo && (tgo.mapGridOccupier !== undefined && tgo.mapGridOccupier === true)

export interface ComponentVisitable {
	readonly visitable?: {
		readonly label: string,
		readonly actions?: ReadonlyArray<Action>,
	},
}

export const hasComponentVisitable = <BaseT extends TgoType>(tgo: BaseT) : tgo is (BaseT & Required<ComponentVisitable>) =>
	tgo && (tgo.visitable !== undefined)

export interface ComponentLabel {
	readonly label: string,
}

export const hasComponentLabel = <BaseT extends TgoType>(tgo: BaseT) : tgo is (BaseT & Required<ComponentLabel>) =>
	typeof tgo.label !== undefined

export interface ComponentTaskQueue {
	readonly taskQueue: TaskQueueType,
}

export const hasComponentTaskQueue = <BaseT extends TgoType>(tgo: BaseT) : tgo is (BaseT & Required<ComponentTaskQueue>) =>
	typeof tgo.taskQueue !== undefined

export interface ComponentPresentation {
	readonly presentation: {
		readonly color: string
	},
}

export const hasComponentPresentation = <BaseT extends TgoType>(tgo: BaseT) : tgo is (BaseT & Required<ComponentPresentation>) =>
	typeof tgo.presentation !== 'undefined'

export interface ComponentComponents {
	readonly components: ReadonlyArray<ComponentType>,
}

export const hasComponentComponents = <BaseT extends TgoType>(tgo: BaseT) : tgo is (BaseT & Required<ComponentComponents>) =>
	Array.isArray(tgo.components)

export interface ComponentWork {
	readonly work: Work,
}

export const isComponentWork = <BaseT extends TgoType>(tgo: BaseT) : tgo is (BaseT & Required<ComponentWork>) =>
	typeof tgo.work !== undefined

export interface ComponentGoal {
	readonly goal: Goal,
}

export const isComponentGoal = <BaseT extends TgoType>(tgo: BaseT) : tgo is (BaseT & Required<ComponentGoal>) =>
	typeof tgo.goal !== undefined

export interface ComponentWorkDoer {
	readonly isWorkDoer: true,
}

export const hasComponentWorkDoer = <BaseT extends TgoType>(tgo: BaseT) : tgo is (BaseT & Required<ComponentWorkDoer>) =>
	tgo.isWorkDoer == true

export interface ComponentGoalDoer {
	readonly activeGoals: ReadonlyArray<TgoId>,
}

export const hasComponentGoalDoer = <BaseT extends TgoType>(tgo: BaseT) : tgo is (BaseT & Required<ComponentGoalDoer>) =>
	Array.isArray(tgo.activeGoals)
