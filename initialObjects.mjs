import * as tgoActions from './actions/tgo';

export const createPlayerAction = () => {
	return tgoActions.add({
		typeId: 'player',
		components: [
			'selfMoving',
			['inventoryChange', { typeId: 'calories', perTick: -0.5 }],
		],
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
	});
};

export const storeGeneralAction = () => tgoActions.add({
	label: 'General Store',
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
				onClick: {
					type: 'STORE_TRANSACTION_REQUEST',
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
			},
			{
				label: 'sellPineapple',
				onClick: {
					type: 'STORE_TRANSACTION_REQUEST',
					items: [
						{
							typeId: 'pineApple',
							count: -1,
						},
						{
							typeId: 'money',
							count: 10,
						},
					],
				},
			}
		],
	}
});

export const leaderBoardAction = () => tgoActions.add({
	label: 'Leaderboard',
	leaderBoard: true,
	position: { x: 4, y: 5},
	color: 'yellow',
	visitable: {
		label: 'Leaderboard',
	},
});

export const tileSetBasicAction = () => ({
	type: 'TILESET_ADD',
	tileSet: {
		tileSetId: 'basic',
		tiles: [
			{ tileId: 0, fillStyle: 'cyan', },
			{ tileId: 1, fillStyle: 'green', },
		]
	}
});

const initialObjectActions = () => [
	storeGeneralAction(),
	leaderBoardAction(),
	tileSetBasicAction(),
]

export default initialObjectActions;
