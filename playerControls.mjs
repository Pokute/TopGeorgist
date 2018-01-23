import store from './store';

const getPlayer = (state) => {
	const s = state ? state : store.getState();
	return s.tgos.find(tgo => tgo.tgoId === s.defaults.playerId);
}

const movePlayerRight = () => {
	const p = getPlayer();
	store.dispatch({
		type: 'TGO_SET_POSITION',
		tgoId: p.tgoId,
		position: {...p.position, x: p.position.x + 5},
	});
};

const giveServerSomethingToThink = () => {
	global.ws.send('GET_ALL_OBJECTS');
};

export { movePlayerRight, giveServerSomethingToThink };
