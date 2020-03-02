import { Recipe } from '../reducers/recipe';
import { TypeId } from '../reducers/itemType';

export const move: Recipe = {
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

export const consume: Recipe = {
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

export const harvest: Recipe = {
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

export const smelt: Recipe = {
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

export const trade: Recipe = {
	type: 'trade',
	actorItemChanges: [
		{
			typeId: 'calculation' as TypeId,
			count: -10,
		}
	],
	targetItemChanges: [],
};
