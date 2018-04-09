const initialState = {
	tileSetId: undefined,
	tiles: {},
};

export default (state = initialState, action) => {
	switch (action.type) {
		case 'TILESET_ADD_TILE':
			return {
				...state,
				[action.tile.tileId]: action.tile,
			};
		default:
			return state;
	}
};
