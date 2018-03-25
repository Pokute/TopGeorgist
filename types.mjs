import transaction from './actions/transaction';
import { plant } from './actions/plantable';
import * as netActions from './actions/net';

const defaultType = {
	stackable: true,
	isInteger: true,
	positiveOnly: true,
	building: false,
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
		components: [
			'consumable',
		],
	},
	'pineAppleShoot': {
		components: [
			'plantable',
		],
		label: 'Pineapple shoot',
		stackable: true,
		isInteger: true,
		building: true,
		growsIntoTypeId: 'pineApple',
	},
	'player': {
		label: 'Player',
		stackable: false,
	},
	'building': {
		label: 'Building',
		stackable: false,
		building: true,
	},
	'plant': {
		label: 'Plant',
		stackable: false,
		isInteger: true,
		building: true
	},
};

const createItemTypeAction = it => ({
	type: 'ITEMTYPE_ADD',
	itemType: it,
});

const createItemTypes = dispatch => {
	const actions = Object.entries(items)
		.map(([key, val]) => ({ ...val, typeId: key }))
		.map(i => ({ ...defaultType, ...i }))
		.map(createItemTypeAction);
	actions.forEach(a => dispatch(a));
};

export default createItemTypes;
