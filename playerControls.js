import store from './store';

const movePlayerRight = () => {
	const pos = store.getState().tgos[0].position;
	store.dispatch({
		type: 'TGO_SET_POSITION',
		tgoId: 'jesh',
		position: {...pos, x: pos.x + 5},
	});
};

export { movePlayerRight };
