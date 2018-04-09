import tileSetReducer from './tileSet';

const initialState = {};
const listActions = [
	'TILESET_ADD',
	'TILESETS_SET',
];

export default (state = initialState, action) => {
	if ((action.tileSetId) &&
		(listActions.indexOf(action.type) === -1)) {
		const modifiedTileSet = tileSetReducer(state[action.tileSetId], action);
		if (modifiedTileSet) {
			return {
				...state,
				[action.tileSetId]: modifiedTileSet,
			};
		}

		return state;
	}
	switch (action.type) {
		case 'TILESET_ADD':
			return {
				...state,
				[action.tileSet.tileSetId]: action.tileSet,
			};
		case 'TILESETS_SET':
			return action.tileSetsState;
		default:
			return state;
	}
};
