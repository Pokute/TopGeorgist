import { createAction, ActionType, getType } from 'typesafe-actions';
import { MersenneTwister19937, nativeMath, integer as randomInteger } from 'random-js';

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

export const mapPosition = Object.assign(
	function createMapPosition(x: number, y: number): MapPosition {
		return ({
			x, y
		}) as MapPosition;
	},
	({
		matching: function({ x, y }: MapPosition, { x: x2, y: y2 }: MapPosition) {
			return (x == x2) && (y == y2);
		},
		isZero: function({ x, y }: MapPosition) {
			return x === 0 && y === 0;
		},
		sum: function({ x, y }: MapPosition, { x: x2, y: y2 }: MapPosition) {
			return {
				x: x + x2,
				y: y + y2,
			} as MapPosition;
		},
		subtract: function({ x, y }: MapPosition, { x: x2, y: y2 }: MapPosition) {
			return {
				x: x - x2,
				y: y - y2,
			} as MapPosition;
		},
		distance: function(a: MapPosition, b: MapPosition) {
			const difference = mapPosition.subtract(a, b);
			return Math.sqrt(Math.pow(difference.x, 2) + Math.pow(difference.y, 2));
		},
		distanceManhattan: function(a: MapPosition, b: MapPosition) {
			const difference = mapPosition.subtract(a, b);
			return Math.abs(difference.x) + Math.abs(difference.y);
		},
		signedTowards: function(from: MapPosition, to: MapPosition): MapPosition {
			const difference = mapPosition.subtract(to, from);
			return {
				x: Math.sign(difference.x),
				y: Math.sign(difference.y),
			} as MapPosition;
		},

		zero: function() {
			return { x: 0, y: 0 } as MapPosition;
		},
	})
);

export type MapSize = Opaque<{
	readonly x: number,
	readonly y: number,
}, 'MapSize'>;

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
