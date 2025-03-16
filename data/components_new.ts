import { type TgoType, type TgoRoot } from '../reducers/tgo.ts';
import { type ComponentPosition } from '../components/position.ts';
import { type TypeId } from '../reducers/itemType.ts';
import { type Parameter } from '../ui/ParamInputType.ts';

export interface Action {
	readonly label: string,
	readonly parameters?: ReadonlyArray<Parameter>,
	readonly onClick: {
		readonly type: string,
		readonly items?: ReadonlyArray<{
			readonly typeId: TypeId,
			readonly count: number,
		}>,
		readonly [extra: string]: any,
	},
}

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

export type ComponentStatsBoard = 
TgoRoot & {
	readonly statsBoard: true,
};

export const hasComponentStatsBoard = <BaseT extends TgoType>(tgo: BaseT) : tgo is (BaseT & Required<ComponentStatsBoard>) =>
	tgo && (tgo.statsBoard !== undefined && tgo.statsBoard === true);

export type ComponentMapGridOccipier = 
TgoRoot &  {
	readonly mapGridOccupier: true,
};

export const hasComponentMapGridOccipier = <BaseT extends TgoType>(tgo: BaseT) : tgo is (BaseT & Required<ComponentMapGridOccipier>) =>
	tgo && (tgo.mapGridOccupier !== undefined && tgo.mapGridOccupier === true);

export type ComponentVisitable = 
ComponentPosition & {
	readonly visitable: {
		readonly label: string,
		readonly actions?: ReadonlyArray<Action>,
	},
};

export const hasComponentVisitable = <BaseT extends TgoType>(tgo: BaseT) : tgo is (BaseT & Required<ComponentVisitable>) =>
	tgo && (tgo.visitable !== undefined);

export type ComponentPresentation = 
TgoRoot & {
	readonly presentation: {
		readonly color: string
	},
};

export const hasComponentPresentation = <BaseT extends TgoType>(tgo: BaseT) : tgo is (BaseT & Required<ComponentPresentation>) =>
	tgo && typeof tgo.presentation !== 'undefined';
