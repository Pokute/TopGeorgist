import * as tgosActions from '../actions/tgos.js';
import { add as tileSetAdd } from '../actions/tileSets.js';
import { Parameter } from '../ui/paramInput.js';
import { MapPosition } from '../concerns/map.js';
import { TypeId } from '../reducers/itemType.js';
import { getType } from 'typesafe-actions';
import { payRent, claimLand } from '../concerns/rentOffice.js';
import { move, digestHydrocarbons } from './recipes.js';

const defaultPlayerTgo: Parameters<typeof tgosActions.add>[0] = {
	player: true,
	components: [
		['inventoryChange', { typeId: 'calories' as TypeId, perTick: -0.5 }],
	],
	activeGoals: [],
	position: { x: 5, y: 5 } as MapPosition,
	presentation: { color: 'red' },
	inventory: [
		{
			typeId: 'calories' as TypeId,
			count: 2000,
		},
		{
			typeId: 'money' as TypeId,
			count: 500,
		},
		{
			typeId: 'pineApple' as TypeId,
			count: 10,
		},
	],
	recipeInfos: [
		{
			recipe: move,
//			autoRun: true, // Generate PositionChanges only when needed.
		},
		{
			recipe: digestHydrocarbons,
			autoRun: true,
		}
	],
	consumer: {
		allowList: [
			'hydrocarbons' as TypeId,
		],
	},
} as const;

export const createPlayerAction = () => tgosActions.add(defaultPlayerTgo);

export const storeGeneralAction = () => tgosActions.add({
	label: 'General Store',
	mapGridOccupier: true,
	position: { x: 12, y: 12 } as MapPosition,
	presentation: { color: 'pink' },
	inventory: [
		{
			typeId: 'money' as TypeId,
			count: 5000,
		},
		{
			typeId: 'pineApple' as TypeId,
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
							typeId: 'pineApple' as TypeId,
							count: +1,
						},
						{
							typeId: 'money' as TypeId,
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
							typeId: 'pineApple' as TypeId,
							count: -1,
						},
						{
							typeId: 'money' as TypeId,
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
	position: { x: 9, y: 8 } as MapPosition,
	presentation: { color: 'pink' },
	inventory: [
		{
			typeId: 'money' as TypeId,
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
					type: getType(claimLand),
				},
			},
			{
				label: 'Pay outstanding rent',
				onClick: {
					type: getType(payRent),
				},
			},
		],
	},
});

export const GovernmentAction = () => tgosActions.add({
	label: 'Government',
	governmentBuilding: true,
	mapGridOccupier: true,
	position: { x: 7, y: 11 } as MapPosition,
	presentation: { color: 'pink' },
	inventory: [
		{
			typeId: 'money' as TypeId,
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

export const statsBoardAction = () => tgosActions.add({
	mapGridOccupier: true,
	label: 'Statsboard',
	statsBoard: true,
	position: { x: 4, y: 5 } as MapPosition,
	presentation: { color: 'yellow' },
	visitable: {
		label: 'Statsboard',
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
	statsBoardAction(),
	tileSetBasicAction(),
];

export default initialObjectActions;
