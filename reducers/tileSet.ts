import { ActionType, getType } from 'typesafe-actions';

import * as tileSetActions from '../actions/tileSet'; 
import { TileType } from './tile';

export type TilesType = {
	readonly [extraProps: string]: TileType;
};

export type TileSetId = keyof TilesType;

export interface TileSetType {
	readonly tileSetId: TileSetId,
	readonly tiles: TilesType,
};

const initialState: TileSetType = {
	tileSetId: '',
	tiles: {},
};

type TileSetAction = ActionType<typeof tileSetActions>;

export default (state: TileSetType = initialState, action: TileSetAction): TileSetType => {
	switch (action.type) {
		case (getType(tileSetActions.addTile)):
			return {
				...state,
				[action.payload.tile.tileId]: action.payload.tile,
			};
		default:
			return state;
	}
};
