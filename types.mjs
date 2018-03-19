import store from './store';
import transaction from './actions/transaction';
import { plant } from './actions/plantable';
import * as netActions from './actions/net';

const defaultType = {
	stackable: true,
	isInteger: true,
	positiveOnly: true,
	building: false,
}

const getPlayer = (state) => {
	const s = state ? state : store.getState();
	return s.tgos.find(tgo => tgo.tgoId === s.defaults.playerTgoId);
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
				onClick: (actorTgoId) => netActions.send(transaction({
					tgoId: actorTgoId,
					items: [
						{
							typeId: 'calories',
							count: +500,
						},
						{
							typeId: 'pineApple',
							count: -1,
						},
					],
				})),
			},
			{
				label: 'Make into shoots',
				onClick: (actorTgoId) => netActions.send(transaction({
					tgoId: actorTgoId,
					items: [
						{
							typeId: 'pineAppleShoot',
							count: +2,
						},
						{
							typeId: 'pineApple',
							count: -1,
						},
					],
				}))
			},
		]
	},
	'pineAppleShoot': {
		label: 'Pineapple shoot',
		stackable: true,
		isInteger: true,
		building: true,
		growsIntoTypeId: 'pineApple',
		actions: [{
			label: 'Plant',
			onClick: (actorTgoId) => netActions.send(plant(actorTgoId, 'pineAppleShoot')),
		}],
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

const createItemTypes = () => {
	const actions = Object.entries(items)
		.map(([key, val]) => ({ ...val, typeId: key }))
		.map(i => ({ ...defaultType, ...i }))
		.map(createItemTypeAction);
	actions.forEach(a => store.dispatch(a));
};

export default createItemTypes;
