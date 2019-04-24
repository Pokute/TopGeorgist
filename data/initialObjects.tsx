import * as tgosActions from '../actions/tgos';
import { add as tileSetAdd } from '../actions/tileSets';
import { Parameter } from '../ui/paramInput';

export const createPlayerAction = () => tgosActions.add({
	player: true,
	components: [
		['inventoryChange', { typeId: 'calories', perTick: -0.5 }],
		'consumer',
		'player',
	],
	activeGoals: [],
	position: { x: 5, y: 5 },
	presentation: { color: 'red' },
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

export const storeGeneralAction = () => tgosActions.add({
	label: 'General Store',
	mapGridOccupier: true,
	position: { x: 12, y: 12 },
	presentation: { color: 'pink' },
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

export const rentOfficeAction = () => tgosActions.add({
	label: 'Rent office',
	rentOffice: true,
	mapGridOccupier: true,
	position: { x: 9, y: 8 },
	presentation: { color: 'pink' },
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

export const GovernmentAction = () => tgosActions.add({
	label: 'Government',
	governmentBuilding: true,
	mapGridOccupier: true,
	position: { x: 7, y: 11 },
	presentation: { color: 'pink' },
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

export const leaderBoardAction = () => tgosActions.add({
	mapGridOccupier: true,
	label: 'Leaderboard',
	leaderBoard: true,
	position: { x: 4, y: 5 },
	presentation: { color: 'yellow' },
	visitable: {
		label: 'Leaderboard',
	},
});

export const tileSetBasicAction = () => tileSetAdd({
	tileSetId: 'basic',
	tiles: {
		'0': { tileId: '0', fillStyle: 'cyan' },
		'1': { tileId: '1', fillStyle: 'green' },
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
