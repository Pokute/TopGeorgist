import playerReducer from './player';
const initialState = [];

export default (state = initialState, action) => {
	switch (action.type) {
		case 'ADD_PLAYER':
			return [
				...state,
				action.player,
			];
		case 'PLAYER_SET_POSITION':
		case 'PLAYER_SET_COLOR':
			return state.map((p) => {
				return (p.tgoId === action.tgoId) ?
					playerReducer(p, action) : p;
			});
		default:
			return state;
	}
};
