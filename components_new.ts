export interface TgoNone {
}

export interface ComponentPosition {
	readonly position: {
		readonly x: number,
		readonly y: number,
	},
}

export const hasComponentPosition = (tgo: TgoNone & Partial<ComponentPosition>) : tgo is TgoNone & ComponentPosition =>
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

export const hasComponentRentOffice = (tgo: TgoNone & Partial<ComponentRentOffice>) : tgo is TgoNone & ComponentRentOffice =>
	tgo && (tgo.rentOffice !== undefined && tgo.rentOffice === true)

export type ComponentGovernmentBuilding = 
	ComponentPosition & {
	readonly governmentBuilding: true,
}

export const hasComponentGovernmentBuilding = (tgo: TgoNone & Partial<ComponentGovernmentBuilding>) : tgo is TgoNone & ComponentGovernmentBuilding =>
	tgo && (tgo.governmentBuilding !== undefined && tgo.governmentBuilding === true)

export interface ComponentLeaderBoard {
	readonly leaderBoard: true,
}

export const hasComponentLeaderBoard = (tgo: TgoNone & Partial<ComponentLeaderBoard>) : tgo is TgoNone & ComponentLeaderBoard =>
	tgo && (tgo.leaderBoard !== undefined && tgo.leaderBoard === true)

export interface ComponentMapGridOccipier {
	readonly mapGridOccupier: true,
}

export const hasComponentMapGridOccipier = (tgo: TgoNone & Partial<ComponentMapGridOccipier>) : tgo is TgoNone & ComponentMapGridOccipier =>
	tgo && (tgo.mapGridOccupier !== undefined && tgo.mapGridOccupier === true)

export interface ComponentPlayer {
		readonly player: true,
	}
	
	export const hasComponentPlayer = (tgo: TgoNone & Partial<ComponentPlayer>) : tgo is TgoNone & ComponentPlayer =>
		tgo && (tgo.player !== undefined && tgo.player === true)
	