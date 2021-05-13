import { createAction } from 'typesafe-actions';
import { TileSetType } from '../reducers/tileSet.js';
import { TileSetsState } from '../reducers/tileSets.js';

export const add = createAction('TILESETS_ADD',
	(tileSet: TileSetType) => (tileSet)
)();

export const set = createAction('TILESETS_SET',
	(tileSetsState: TileSetsState) => (tileSetsState)
)();
