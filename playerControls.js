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
		type: 'PLAYER_ADD_CALORIES',
		tgoId: p.tgoId,
		dCalories: +500,
	});
	store.dispatch({
		type: 'MODIFY_INVENTORY',
		tgoId: p.tgoId,
		foodId: 'pineApple',
		dAmount: -1,
	})
};

export { movePlayerRight, playerEatFood };
