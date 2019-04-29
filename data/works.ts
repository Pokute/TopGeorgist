import { Work } from '../reducers/work';

export const moveWork: Work = {
	type: 'move',
	actorItemChanges: [
		{
			typeId: 'calories',
			count: -20,
		},
		{
			typeId: 'tick',
			count: -3,
		},
		{
			typeId: 'position',
			count: 1,
		},
	],
	targetItemChanges: [],
};

export const consumeWork: Work = {
	type: 'consume',
	actorItemChanges: [
		{
			typeId: 'calories',
			count: 100,
		},
		{
			typeId: 'tick',
			count: -2,
		},
	],
	targetItemChanges: [
		{
			typeId: 'calories',
			count: -100,
		},
	],
};

export const harvestWork: Work = {
	type: 'harvest',
	actorItemChanges: [
		{
			typeId: 'berry',
			count: 10,
		},
		{
			typeId: 'tick',
			count: -1,
		},
	],
	targetItemChanges: [
		{
			typeId: 'berry',
			count: -10,
		}
	],
};

export const smeltWork: Work = {
	type: 'smelt',
	actorItemChanges: [
		{
			typeId: 'ironOre',
			count: -4,
		},
		{
			typeId: 'tick',
			count: -2,
		},
		{
			typeId: 'ironIngot',
			count: 2,
		},
	],
	targetItemChanges: [
		{
			typeId: 'smeltingWork', // Non-storeable
			count: -5,
		},
	],
};

export const tradeWork: Work = {
	type: 'trade',
	actorItemChanges: [
		{
			typeId: 'calculation',
			count: -10,
		}
	],
	targetItemChanges: [],
};
