import { createAction } from 'typesafe-actions';
import { TileType } from '../reducers/tile.js';
import { TileSetId } from '../reducers/tileSet.js';

export const addTile = createAction('TILESET_ADD_TILE',
	(tileSetId: TileSetId, tile: TileType) => ({
		tileSetId,
		tile
	})
)();
