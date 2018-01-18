import store from './store.js';
import * as inventoryActions from './actions/inventory';
import transaction from './actions/transaction';
import playerActions from './reducers/player';

const createInitialObjects = () => {
	// Player
	store.dispatch({
		type: 'TGO_ADD',
		tgo: {
			tgoId: 'jesh',
			typeId: 'player',
			position: {x: 5, y: 5},
			color: 'red',
			inventory: [
				{
					typeId: 'calories',
					count: 2000,
				},
				{
					typeId: 'money',
					count: 500,
				},
				{
					typeId: 'pineApple',
					count: 10,
				},
			],
			tick: (tgo) => {
				const actions = [];
				if (tgo.moveTarget) {
					if ((tgo.moveTarget.x === tgo.position.x) &&
						(tgo.moveTarget.y === tgo.position.y)) {
						actions.push({
							type: 'PLAYER_SET_MOVE_TARGET',
							tgoId: tgo.tgoId,
							moveTarget: undefined,
						});
					} else {
						if  (tgo.inventory) {
							const cals = tgo.inventory.find(ii => ii.typeId === 'calories');
							if (cals && cals.count > 0)
							actions.push({
								type: 'TGO_SET_POSITION',
								tgoId: tgo.tgoId,
								position: {
									x: tgo.position.x + Math.sign(tgo.moveTarget.x - tgo.position.x),
									y: tgo.position.y + Math.sign(tgo.moveTarget.y - tgo.position.y),
								},
							});
							actions.push(inventoryActions.add(tgo.tgoId, 'calories', -10));
						}
					}
				}
				if  (tgo.inventory) {
					const cals = tgo.inventory.find(ii => ii.typeId === 'calories');
					if (cals && cals.count > 0) {
						actions.push(inventoryActions.add(tgo.tgoId, 'calories', -1));
					}
				}
				return actions;
			},
		}
	});
	store.dispatch({
		type: 'DEFAULTS_SET_PLAYER',
		tgoId: 'jesh',
	});

	// General store
	store.dispatch({
		type: 'TGO_ADD',
		tgo: {
			tgoId: 'genStore',
			typeId: 'building',
			position: { x: 12, y: 12},
			color: 'pink',
			inventory: [
				{
					typeId: 'money',
					count: 5000,
				},
				{
					typeId: 'pineApple',
					count: 100,
				},
			],
			visitable: {
				label: 'First Store',
				actions: [
					{
						label: 'buyPineapple',
						onClick: (actorTgoId, targetTgoId) => {
							store.dispatch(transaction(
								{
									tgoId: actorTgoId,
									items: [
										{
											typeId: 'pineApple',
											count: +1,
										},
										{
											typeId: 'money',
											count: -20,
										},
									],
								},
								{
									tgoId: targetTgoId,
									items: [
										{
											typeId: 'pineApple',
											count: -1,
										},
										{
											typeId: 'money',
											count: +20,
										},
									],
								},
							));
						}
					},
					{
						label: 'sellPineapple',
						onClick: (actorTgoId, targetTgoId) => {
							store.dispatch(transaction(
								{
									tgoId: actorTgoId,
									items: [
										{
											typeId: 'pineApple',
											count: -1,
										},
										{
											typeId: 'money',
											count: +10,
										},
									],
								},
								{
									tgoId: targetTgoId,
									items: [
										{
											typeId: 'pineApple',
											count: +1,
										},
										{
											typeId: 'money',
											count: -10,
										},
									],
								},
							));
						}
					}
				],
			}
		},
	});

	store.dispatch({
		type: 'TILESET_ADD',
		tileSet: {
			tileSetId: 'basic',
			tiles: [
				{ tileId: 0, fillStyle: 'cyan', },
				{ tileId: 1, fillStyle: 'green', },
			]
		}
	});
}

export default createInitialObjects;