import { type ActionType, createAction } from 'typesafe-actions';

import { type TileType } from '../reducers/tile.ts';
import { type TileSetId } from '../reducers/tileSet.ts';

export const addTile = createAction('TILESET_ADD_TILE',
	(tileSetId: TileSetId, tile: TileType) => ({
		tileSetId,
		tile
	})
)();

export const tileSetActions = {
	addTile,
} as const;
export type TileSetActions = ActionType<typeof tileSetActions>;
