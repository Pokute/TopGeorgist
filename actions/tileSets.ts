import { type ActionType, createAction } from 'typesafe-actions';

import { type TileSetType } from '../reducers/tileSet.ts';
import { type TileSetsState } from '../reducers/tileSets.ts';

export const add = createAction('TILESETS_ADD',
	(tileSet: TileSetType) => (tileSet)
)();

export const set = createAction('TILESETS_SET',
	(tileSetsState: TileSetsState) => (tileSetsState)
)();

export const tileSetsActions = {
	add,
	set,
} as const;
export type TileSetsActions = ActionType<typeof tileSetsActions>;
