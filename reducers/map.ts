import { engines as randomEngines, integer as randomInteger } from 'random-js';

import * as mapActions from '../actions/map'; 
import { ActionType, getType } from 'typesafe-actions';

export interface MapPosition {
	readonly x: number,
	readonly y: number,
};

export interface MapSize {
	readonly x: number,
	readonly y: number,
};

type PositionDistanceEuclidean = { distance: number };
type PositionDistanceManhattan = { distanceManhattan: number };
type PositionDistance = PositionDistanceEuclidean | PositionDistanceManhattan;
const isDistanceEuclidean = (distance: PositionDistance): distance is PositionDistanceEuclidean =>
	distance.hasOwnProperty('distance');

export const getPositionOffset = (a: MapPosition, b: MapPosition): MapPosition => ({
	x: a.x - b.x,
	y: a.y - b.y,
});
export const getPositionDistanceManhattan = (a: MapPosition, b: MapPosition) => {
	const offset = getPositionOffset(a, b)
	return {
		x: Math.abs(offset.x),
		y: Math.abs(offset.y),
	}
};

export const positionMatches = (a: MapPosition, b: MapPosition, distance: PositionDistance = { distanceManhattan: 0 }) => {
	const distanceManhattan = getPositionDistanceManhattan(a, b);
	const usedDistance = isDistanceEuclidean(distance)
		? Math.sqrt(Math.pow(distanceManhattan.x, 2) + Math.pow(distanceManhattan.y, 2))
		: distanceManhattan.x + distanceManhattan.y;
	return (usedDistance == 0);
};

type TileDataType = number;

export interface MapType {
	readonly seed: number,
	readonly size: MapPosition,
	readonly tileSize: number,
	readonly tileSetId: string,
	readonly data: ReadonlyArray<TileDataType>,
	readonly minTileId?: number,
	readonly maxTileId?: number,
};

const initialState = {
	seed: 0,
	size: { x: 0, y: 0 },
	tileSize: 40,
	tileSetId: 'basic',
	// minTileId: 0,
	// maxTileId: 0,
	data: [],
};

export interface MapSettings {
	readonly size: MapSize,
	readonly minTileId?: number,
	readonly maxTileId?: number,
	readonly seed?: number,
};

const defaultSettings = {
	size: { x: 20, y: 20 },
	minTileId: 0,
	maxTileId: 2,
};

const fillMapData = (usedSettings: MapSettings, fillWith: number | (() => number)) => ({
	...usedSettings,
	data: (typeof fillWith !== 'function') ?
		Array(usedSettings.size.x * usedSettings.size.y)
			.fill(fillWith, 0, usedSettings.size.x * usedSettings.size.y) :
		Array(usedSettings.size.x * usedSettings.size.y)
			.fill(0, 0, usedSettings.size.x * usedSettings.size.y)
			.map(_ => fillWith()),
});

type MapAction = ActionType<typeof mapActions>;

export default (state: MapType = initialState, action: MapAction): MapType => {
	switch (action.type) {
		case getType(mapActions.generate): {
			const mt = randomEngines.mt19937();
			mt.seed(action.payload.settings.seed);
			const usedSettings: Required<MapSettings> = { ...defaultSettings, ...action.payload.settings };
			return {
				...initialState,
				...fillMapData(
					usedSettings,
					() => randomInteger(usedSettings.minTileId, usedSettings.maxTileId)(mt),
				),
			};
		}
		case getType(mapActions.set):
			return action.payload;
		default:
			return state;
	}
};
