import { Action } from "./components";
import { TgoPartials, TgoInitialType, TgoType } from "./reducers/tgo";

export interface ComponentPosition {
	readonly position: {
		readonly x: number,
		readonly y: number,
	},
}

export const hasComponentPosition = <BaseT extends TgoType>(tgo: BaseT) : tgo is (BaseT & Required<ComponentPosition>) =>
	tgo && (tgo.position !== undefined) && (tgo.position.x !== undefined) && (tgo.position.y != undefined)

export type ComponentMoveTarget =
	ComponentPosition & {
	readonly moveTarget: {
		readonly x: number,
		readonly y: number,
	},
}

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

export interface ComponentPlayer {
	readonly player: true,
}
	
export const hasComponentPlayer = <BaseT extends TgoType>(tgo: BaseT) : tgo is (BaseT & Required<ComponentPlayer>) =>
	tgo && (tgo.player !== undefined && tgo.player === true)

export interface ComponentVisitable {
	readonly visitable?: {
		readonly label: string,
		readonly actions?: Action[],
	},
}

export const hasComponentVisitable = <BaseT extends TgoType>(tgo: BaseT) : tgo is (BaseT & Required<ComponentVisitable>) =>
	tgo && (tgo.visitable !== undefined)

export interface ComponentLabel {
	readonly label: string,
}

export const hasComponentLabel = <BaseT extends TgoType>(tgo: BaseT) : tgo is (BaseT & Required<ComponentLabel>) =>
	typeof tgo.label !== undefined
