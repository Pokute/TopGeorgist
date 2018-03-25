import tileSetReducer from './tileSet';
const initialState = {};

export default (state = initialState, action) => {
	// Handle single tgo changes here.
// if ((action.tgoId) && 
// 	(action.type != 'TGO_ADD')) {
// 	return state.map(p => {
// 		if (p.tgoId !== action.tgoId)
// 			return p;
// 		if (action.type.indexOf('TGO_') === 0)
// 			return tgoReducer(p, action);
// 		if (action.type.indexOf('PLAYER_') === 0)
// 			return playerReducer(p, action);
// 		return p;
// 	});
// }
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
