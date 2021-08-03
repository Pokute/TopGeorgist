import { Action, ComponentTicker } from './components.js';
import { TgoType, ComponentType, TgoId, TgoRoot } from '../reducers/tgo.js';
import { TaskQueueType } from '../reducers/taskQueue.js';
import { ComponentPosition } from '../components/position.js';

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
