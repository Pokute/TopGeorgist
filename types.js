import store from './store';

const items = {
	'pineApple': {
	}
};

const createItemTypeAction = it => ({
	type: 'ITEMTYPE_ADD',
	itemType: it,
});

const createItemTypes = () => {
	const actions = Object.entries(items)
		.map(e => ({ ...e[1], typeId: e[0] }))
		.map(createItemTypeAction);
	actions.forEach(a => store.dispatch(a));
};

export default createItemTypes;
