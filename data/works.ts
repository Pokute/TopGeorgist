import { Work } from '../reducers/work';
import { TypeId } from '../reducers/itemType';

export const moveWork: Work = {
	type: 'move',
	actorItemChanges: [
		{
			typeId: 'calories' as TypeId,
			count: -20,
		},
		{
			typeId: 'tick' as TypeId,
			count: -3,
		},
		{
			typeId: 'position' as TypeId,
			count: 1,
		},
	],
	targetItemChanges: [],
};

export const consumeWork: Work = {
	type: 'consume',
	actorItemChanges: [
		{
			typeId: 'calories' as TypeId,
			count: 100,
		},
		{
			typeId: 'tick' as TypeId,
			count: -2,
		},
	],
	targetItemChanges: [
		{
			typeId: 'hydrocarbons' as TypeId,
			count: -100,
		},
	],
};

export const harvestWork: Work = {
	type: 'harvest',
	actorItemChanges: [
		{
			typeId: 'berry' as TypeId,
			count: 10,
		},
		{
			typeId: 'tick' as TypeId,
			count: -1,
		},
	],
	targetItemChanges: [
		{
			typeId: 'berry' as TypeId,
			count: -10,
		}
	],
};

export const smeltWork: Work = {
	type: 'smelt',
	actorItemChanges: [
		{
			typeId: 'ironOre' as TypeId,
			count: -4,
		},
		{
			typeId: 'tick' as TypeId,
			count: -2,
		},
		{
			typeId: 'ironIngot' as TypeId,
			count: 2,
		},
	],
	targetItemChanges: [
		{
			typeId: 'smeltingWork' as TypeId, // Non-storeable
			count: -5,
		},
	],
};

export const tradeWork: Work = {
	type: 'trade',
	actorItemChanges: [
		{
			typeId: 'calculation' as TypeId,
			count: -10,
		}
	],
	targetItemChanges: [],
};

export default [
	moveWork,
	consumeWork,
	harvestWork,
	smeltWork,
	tradeWork,
];
