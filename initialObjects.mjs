import * as tgoActions from './actions/tgo';

export const createPlayerAction = () => tgoActions.add({
	typeId: 'player',
	components: [
		'selfMoving',
		['inventoryChange', { typeId: 'calories', perTick: -0.5 }],
		'consumer',
		'player',
	],
	position: { x: 5, y: 5 },
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

export const storeGeneralAction = () => tgoActions.add({
	label: 'General Store',
	typeId: 'building',
	position: { x: 12, y: 12 },
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
			},
		],
	},
});

export const rentOfficeAction = () => tgoActions.add({
	label: 'Rent office',
	rentOffice: true,
	typeId: 'building',
	position: { x: 9, y: 8 },
	color: 'pink',
	inventory: [
		{
			typeId: 'money',
			count: 25000,
		},
	],
	visitable: {
		label: 'Rent office - visit here to claim and pay for land rent.',
		actions: [
			{
				parameters: [{
					name: 'position',
					label: 'Position',
					type: 'position',
					required: true,
				}],
				label: 'Claim land',
				onClick: {
					type: 'RENT_OFFICE_CLAIM_LAND',
				},
			},
			{
				label: 'Pay outstanding rent',
				onClick: {
					type: 'RENT_OFFICE_PAY_RENT',
				},
			},
		],
	},
});

export const GovernmentAction = () => tgoActions.add({
	label: 'Government',
	governmentBuilding: true,
	typeId: 'building',
	position: { x: 7, y: 11 },
	color: 'pink',
	inventory: [
		{
			typeId: 'money',
			count: 1000000,
		},
	],
	visitable: {
		label: 'Government building - Here you can claim your stipend.',
		actions: [
			{
				label: 'Claim accrued stipend',
				onClick: {
					type: 'GOVERNMENT_CLAIM_STIPEND',
				},
			},
			{
				label: 'Apply for citizenship',
				onClick: {
					type: 'GOVERNMENT_CLAIM_CITIZENSHIP',
				},
			},
		],
	},
});

export const leaderBoardAction = () => tgoActions.add({
	label: 'Leaderboard',
	leaderBoard: true,
	position: { x: 4, y: 5 },
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
			{ tileId: 0, fillStyle: 'cyan' },
			{ tileId: 1, fillStyle: 'green' },
		],
	},
});

const initialObjectActions = () => [
	storeGeneralAction(),
	rentOfficeAction(),
	GovernmentAction(),
	leaderBoardAction(),
	tileSetBasicAction(),
];

export default initialObjectActions;
