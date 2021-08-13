import { createAction, ActionType, getType } from 'typesafe-actions';
import { MersenneTwister19937, nativeMath, integer as randomInteger } from 'random-js';

import isServer from '../isServer.js'
import { Opaque } from '../typings/global.d.js';

// Actions:

export const generate = createAction('MAP_GENERATE',
	(settings: MapSettings) => ({
		settings: {
			seed: randomInteger(-1000000, 1000000)(nativeMath),
			...settings,
		},
	})
)();

export const set = createAction('MAP_SET',
	(mapState: MapType) => (mapState)
)();

export const mapActions = {
	generate,
	set,
} as const;

export type MapActions = ActionType<typeof mapActions>;

// Sagas:

// Reducer:

export type MapPosition = Opaque<{
	readonly x: number,
	readonly y: number,
}, 'MapPosition'>;

export type MapSize = Opaque<{
	readonly x: number,
	readonly y: number,
}, 'MapSize'>;

type PositionDistanceEuclidean = { distance: number };
type PositionDistanceManhattan = { distanceManhattan: number };
type PositionDistance = PositionDistanceEuclidean | PositionDistanceManhattan;
const isDistanceEuclidean = (distance: PositionDistance): distance is PositionDistanceEuclidean =>
	distance.hasOwnProperty('distance');

export const getPositionOffset = (a: MapPosition, b: MapPosition): MapPosition => ({
	x: a.x - b.x,
	y: a.y - b.y,
} as MapPosition);
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
	readonly size: MapSize,
	readonly tileSize: number,
	readonly tileSetId: string,
	readonly data: ReadonlyArray<TileDataType>,
	readonly minTileId?: number,
	readonly maxTileId?: number,
};

export const initialState: MapType = {
	seed: 0,
	size: { x: 0, y: 0 } as MapSize,
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

export const mapReducer = (state: MapType = initialState, action: MapActions): MapType => {
	switch (action.type) {
		case getType(mapActions.generate): {
			const mt = MersenneTwister19937.seed(action.payload.settings.seed);
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
