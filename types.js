import store from './store';

const defaultType = {
	stackable: true,
	isInteger: true,
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
