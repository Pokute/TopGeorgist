import { engines as randomEngines, integer as randomInteger } from 'random-js';

import * as mapActions from '../actions/map'; 

type TileDataType = number;

export interface MapType {
	seed: number,
	size: {
		x: number,
		y: number,
	},
	tileSize: number,
	tileSetId: string,
	data: TileDataType[],
	minTileId?: number,
	maxTileId?: number,
};
import { ActionType, getType } from 'typesafe-actions';

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
	size: {
		x: number,
		y: number,
	},
	minTileId?: number,
	maxTileId?: number,
	seed?: number,
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
