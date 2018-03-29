import * as inventoryActions from './actions/inventory';

const components = {
	selfMoving: {
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
					if (!tgo.inventory) return [];

					const cals = tgo.inventory.find(ii => ii.typeId === 'calories');
					if (cals && cals.count > 0) {
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
			return actions;
		},
	},
	inventoryChange: {
		tick: (tgo, options = { typeId: 'calories', perTick: -1 }) => {
			const actions = [];
			if (tgo.inventory) {
				// const cals = tgo.inventory.find(ii => ii.typeId === options.typeId);
				// if (cals && cals.count > 0) {
				actions.push(inventoryActions.add(tgo.tgoId, options.typeId, options.perTick));
				// }
			}
			return actions;
		},
	},
	consumable: {
		actions: [
			{
				consume: {
					label: 'Eat it',
					onClick: {
						type: 'CONSUMABLE_CONSUME',
					},
					actorRequirements: {
						components: [
							'consumer',
						],
					},
				},
			},
			{
				turnIntoSeeds: {
					label: 'Turn into seeds',
					onClick: {
						type: 'CONSUMABLE_INTO_SEEDS',
					},
				},
			},
		],
	},
	consumer: {

	},
	plantable: {
		actions: [
			{
				consume: {
					label: 'Plant it',
					onClick: {
						type: 'PLANT',
					},
				},
			},
		],
	},
	trader: {
	},
};

export default components;
