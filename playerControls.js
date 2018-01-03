import store from './store';

const movePlayerRight = () => {
	const pos = store.getState().players[0].position;
	store.dispatch({
		type: 'PLAYER_SET_POSITION',
		position: {...pos, x: pos.x + 5},
	});
};

export { movePlayerRight };
