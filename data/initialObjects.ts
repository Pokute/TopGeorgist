import { remove, tgosActions } from '../concerns/tgos.ts';
import { add as tileSetAdd } from '../actions/tileSets.ts';
import { type MapPosition } from '../concerns/map.ts';
import { type TypeId } from '../reducers/itemType.ts';
import { getType } from 'typesafe-actions';
import { payRent, claimLand } from '../concerns/rentOffice.ts';
import { move, digestHydrocarbons, trade, calculation, doCanningWork, canPineApple, provideCanneryTool, growPineapple } from './recipes.ts';
import { tradeStoreTransactionRequest } from '../concerns/trade.ts';
import { type TgoType, type TgoId } from '../reducers/tgo.ts';
import { prefabsActions, type PrefabId } from '#tg/concerns/prefab.ts';
import { collect, deployType } from '#tg/concerns/deployable.ts';

const defaultPlayerTgo: Parameters<typeof tgosActions.add>[0] = {
	player: true,
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
		{
			typeId: 'treeSapling' as TypeId,
			count: 2,
		},
	],
	inventoryIsPhysical: true,
	recipeInfos: [
		{ recipe: move, autoRun: 'OnDemand', },
		{ recipe: digestHydrocarbons, autoRun: 'OnInputs', },
		{ recipe: calculation, autoRun: 'OnDemand' },
		{ recipe: trade, autoRun: 'OnDemand' },
		{ recipe: doCanningWork, autoRun: 'OnDemand' },
		{ recipe: canPineApple, autoRun: 'OnDemand' },
	],
	worksIssued: [],
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
		{
			typeId: 'cannery' as TypeId,
			count: 40,
		},
		{
			typeId: 'canBlank' as TypeId,
			count: 500,
		},
	],
	inventoryIsPhysical: true,
	visitable: {
		label: 'First Store',
		actions: [
			{
				label: 'buyPineapple',
				onClick: {
					type: getType(tradeStoreTransactionRequest),
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
					type: getType(tradeStoreTransactionRequest),
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
			{
				label: 'buyCannery',
				onClick: {
					type: getType(tradeStoreTransactionRequest),
					items: [
						{
							typeId: 'cannery' as TypeId,
							count: +1,
						},
						{
							typeId: 'money' as TypeId,
							count: -200,
						},
					],
				}
			},
			{
				label: 'buyCanBlanks10',
				onClick: {
					type: getType(tradeStoreTransactionRequest),
					items: [
						{
							typeId: 'canBlank' as TypeId,
							count: +10,
						},
						{
							typeId: 'money' as TypeId,
							count: -50,
						},
					],
				}
			},
			{
				label: 'buyCanBlanks50',
				onClick: {
					type: getType(tradeStoreTransactionRequest),
					items: [
						{
							typeId: 'canBlank' as TypeId,
							count: +50,
						},
						{
							typeId: 'money' as TypeId,
							count: -225,
						},
					],
				}
			},
			{
				label: 'sellCannedPineApple',
				onClick: {
					type: getType(tradeStoreTransactionRequest),
					items: [
						{
							typeId: 'cannedPineApple' as TypeId,
							count: -1,
						},
						{
							typeId: 'money' as TypeId,
							count: 25,
						},
					],
				}
			},
			{
				label: 'sellCanEmpty',
				onClick: {
					type: getType(tradeStoreTransactionRequest),
					items: [
						{
							typeId: 'canEmpty' as TypeId,
							count: -1,
						},
						{
							typeId: 'money' as TypeId,
							count: 2,
						},
					],
				}
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
	inventoryIsPhysical: true,
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
	inventoryIsPhysical: true,
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

const prefabCreationActions = () => [
	prefabsActions.add({
		name: 'pineapplePlant' as PrefabId,
		integrateTemplates: [
			{
				tgoId: '__customTgoId_pineapplePlant' as { __TYPE__: "TgoId"; } & '__customTgoId_pineapplePlant',
				label: 'Pineapple plant',
				mapGridOccupier: true,
				position: '__customValue_position',
				presentation: { color: 'yellow' },
				inventory: [
					{ typeId: 'pineApple' as TypeId, count: 1/8, },
					{ typeId: 'growthPotential' as TypeId, count: 3-(1/8), },
				],
				inventoryIsPhysical: true,
				recipeInfos: [{
					recipe: growPineapple, autoRun: 'OnInputs',
				},],
				worksIssued: [],
				visitable: {
					label: 'A growing pineapple.',
					actions: [{
						label: 'Pick up',
						onClick: {
							type: getType(collect),
						},
					}],
				}
			},
		],
	}),
	prefabsActions.add({
		name: 'canneryTool' as PrefabId,
		integrateTemplates: [
			{
				tgoId: '__customTgoId_canneryTool' as { __TYPE__: "TgoId"; } & '__customTgoId_canneryTool',
				label: 'Cannery tool',
				mapGridOccupier: true,
				position: '__customValue_position',
				presentation: { color: 'gray' },
				recipeInfos: [
					{ recipe: provideCanneryTool, autoRun: 'OnDemand' },
				],
				worksIssued: [],
				activeGoals: [
					'__customTgoId_canningToolGoal' as TgoId,
				],
				visitable: {
					label: 'Manual cannery. You can can pineapples here.',
					actions: [{
						label: 'Pick up',
						onClick: {
							type: getType(collect),
						},
					}],
				},
				inventory: [
					{
						typeId: 'tgoId' as TypeId,
						tgoId: '__customTgoId_canningToolGoal' as TgoId,
						count: 1,
					}
				],
				inventoryIsPhysical: true,
			},
			{
				tgoId: '__customTgoId_canningToolGoal' as { __TYPE__: "TgoId"; } & '__customTgoId_canningToolGoal',
				goal: {
					title: 'AutoCanningToolGoal',
					requirements: [
						{
							type: 'RequirementKeepMinimumInventoryItems',
							inventoryItems: [
								{
									typeId: 'canneryTool' as TypeId,
									count: 1,
								}
							],
						},
					],
				},
				worksIssued: [],
			},
		],
	}),
	prefabsActions.add({
		name: 'basicTree' as PrefabId,
		integrateTemplates: [
			{
				tgoId: '__customTgoId_basicTree' as { __TYPE__: "TgoId"; } & '__customTgoId_basicTree',
				label: 'Basic Tree',
				mapGridOccupier: true,
				position: '__customValue_position',
				presentation: { color: 'green' },
				inventory: [
					{
						typeId: 'wood' as TypeId,
						count: 5,
					}
				],
				inventoryIsPhysical: true,
				visitable: {
					label: 'A basic tree. You can chop it down for wood.',
					actions: [
						{
							label: 'Chop down for wood',
							onClick: {
								type: getType(collect),
								// Could add axe requirement here later.
							},
						},
					],
				},
			},
		],
	}),
];

const addTgoWithId = (...params: Parameters<typeof tgosActions.add>): [ReturnType<typeof tgosActions.add>, TgoId] => {
	const addTgoAction = tgosActions.add(...params);
	return [addTgoAction, addTgoAction.payload.tgo.tgoId];
};

const publicCanneryActions = () => {
	const [addTempCanneryOwner, tempCanneryOwnerTgoId] = addTgoWithId({
		inventory: [
			{ typeId: 'cannery' as TypeId, count: 1, },
		],
		position: { x: 6, y: 8 } as MapPosition,
	} as Omit<TgoType, 'tgoId'>);
	return [
		addTempCanneryOwner,
		deployType({
			tgoId: tempCanneryOwnerTgoId,
			deployedTypeId: 'cannery' as TypeId,
		}),
		remove(tempCanneryOwnerTgoId)
	];
};

const initialObjectActions = () => [
	storeGeneralAction(),
	rentOfficeAction(),
	GovernmentAction(),
	statsBoardAction(),
	tileSetBasicAction(),
	...prefabCreationActions(),
	...publicCanneryActions(),
];

export default initialObjectActions;
