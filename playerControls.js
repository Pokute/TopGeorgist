import store from './store';

const getPlayer = (state) => {
	const s = state ? state : store.getState();
	return s.tgos.find(tgo => tgo.tgoId === s.playerId);
}

const movePlayerRight = () => {
	const p = getPlayer();
	store.dispatch({
		type: 'TGO_SET_POSITION',
		tgoId: p.tgoId,
		position: {...p.position, x: p.position.x + 5},
	});
};

export { movePlayerRight };