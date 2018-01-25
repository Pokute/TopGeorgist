import store from './store';

const getPlayer = (state) => {
	const s = state ? state : store.getState();
	return s.tgos.find(tgo => tgo.tgoId === s.defaults.playerId);
}

export const movePlayerRight = () => {
	const p = getPlayer();
	store.dispatch({
		type: 'TGO_SET_POSITION',
		tgoId: p.tgoId,
		position: {...p.position, x: p.position.x + 5},
	});
};

export const giveServerSomethingToThink = () => {
	global.ws.send('GET_ALL_OBJECTS');
};

export const requestPlayer = (playerLabel) => {
	global.ws.send({
		action: {
			type: 'PLAYER_CREATE_REQUEST',
			label: playerLabel,
		},
	});
};
