import { createAction } from 'typesafe-actions';
import { TileType } from '../reducers/tile';
import { TileSetId } from '../reducers/tileSet';

export const addTile = createAction('TILESET_ADD_TILE',
	(tileSetId: TileSetId, tile: TileType) => ({
		tileSetId,
		tile
	})
)();
