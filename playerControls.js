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

const playerEatFood = () => {
//	if (p.inventory.find())
	const p = getPlayer();
	store.dispatch({
		type: 'TGO_INVENTORY_ADD',
		tgoId: p.tgoId,
		item: {
			typeId: 'calories',
			count: +500,
		},
	});
	store.dispatch({
		type: 'TGO_INVENTORY_ADD',
		tgoId: p.tgoId,
		item: {
			typeId: 'pineApple',
			count: -1,
		},
	});
};

export { movePlayerRight, playerEatFood };
