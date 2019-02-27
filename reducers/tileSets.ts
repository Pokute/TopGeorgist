import { ActionType, getType } from 'typesafe-actions';

import * as tileSetActions from '../actions/tileSet';
import * as tileSetsActions from '../actions/tileSets';
import tileSetReducer, { TileSetType } from './tileSet';

export type TileSetsState = {
	readonly [extraProps: string]: TileSetType;
};

const initialState = {};

const tileSetActions2 = [
	tileSetActions.addTile,
].map(a => getType(a));

const listActions = [
	tileSetsActions.add,
	tileSetsActions.set,
].map(a => getType(a));

type TileSetAction = ActionType<typeof tileSetActions>;
type TileSetsAction = ActionType<typeof tileSetsActions>;

export default (state: TileSetsState = initialState, action: TileSetAction | TileSetsAction): TileSetsState => {
	// Handle single view changes here.
	if (tileSetActions2.some(a => a === action.type)) {
		const tileAction = action as TileSetAction;
		const newTileSet = tileSetReducer(state[tileAction.payload.tileSetId], tileAction);
		if (newTileSet !== state[tileAction.payload.tileSetId]) {
			return {
				...state,
				[tileAction.payload.tileSetId]: newTileSet,
			};
		}
		return state;
	}

	switch (action.type) {
		case getType(tileSetsActions.add):
			return {
				...state,
				[action.payload.tileSetId]: action.payload,
			};
		case getType(tileSetsActions.set):
			return action.payload;
		default:
			return state;
	}
};
