import { createAction } from 'typesafe-actions';
import { TileSetType } from '../reducers/tileSet';
import { TileSetsState } from '../reducers/tileSets';

export const add = createAction('TILESETS_ADD', (resolve) => {
	return (tileSet: TileSetType) => resolve(tileSet);
});

export const set = createAction('TILESETS_SET', (resolve) => {
	return (tileSetsState: TileSetsState) => resolve(tileSetsState);
});
