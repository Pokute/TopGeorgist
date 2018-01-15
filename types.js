import store from './store';

const defaultType = {
	stackable: true,
	isInteger: true,
	positiveOnly: true,
}


const getPlayer = (state) => {
	const s = state ? state : store.getState();
	return s.tgos.find(tgo => tgo.tgoId === s.playerId);
}
 
const items = {
	'calories': {
		label: 'Calories',
		stackable: true,
		isInteger: false,
	},
	'money': {
		label: 'Money',
		stackable: true,
	},
	'pineApple': {
		label: 'Pineapple',
		stackable: true,
		isInteger: false,
		actions: [
			{
				label: 'Eat a pineapple',
				onClick: (actorTgoId, target) => {
					const p = getPlayer();
					store.dispatch({
						type: 'TGO_INVENTORY_ADD',
						tgoId: actorTgoId,
						item: {
							typeId: 'calories',
							count: +500,
						},
					});
					store.dispatch({
						type: 'TGO_INVENTORY_ADD',
						tgoId: actorTgoId,
						item: {
							typeId: 'pineApple',
							count: -1,
						},
					});
				}
			},
		]
	},
};

const createItemTypeAction = it => ({
	type: 'ITEMTYPE_ADD',
	itemType: it,
});

const createItemTypes = () => {
	const actions = Object.entries(items)
		.map(e => ({ ...e[1], typeId: e[0] }))
		.map(i => ({ ...defaultType, ...i }))
		.map(createItemTypeAction);
	actions.forEach(a => store.dispatch(a));
};

export default createItemTypes;
