import { Recipe, RecipeId } from '../reducers/recipe.js';
import { TypeId } from '../reducers/itemType.js';

export const move: Recipe = {
	type: 'move' as RecipeId,
	input: [
		{
			typeId: 'calories' as TypeId,
			count: 20,
		},
		{
			typeId: 'tick' as TypeId,
			count: 3,
		},
	],
	output: [{
		typeId: 'movementAmount' as TypeId,
		count: 1,
	}],
};

export const consume: Recipe = {
	type: 'consume' as RecipeId,
	input: [
		{
			typeId: 'hydrocarbons' as TypeId,
			count: 100,
		},
		{
			typeId: 'tick' as TypeId,
			count: 2,
		},
	],
	output: [
		{
			typeId: 'calories' as TypeId,
			count: 100,
		},
	],
};

export const digestHydrocarbons = {
	type: 'digestHydrocarbons' as RecipeId,
	input: [
		{
			typeId: 'hydrocarbons' as TypeId,
			count: 100,
		},
		{
			typeId: 'tick' as TypeId,
			count: 2,
		},
	],
	output: [
		{
			typeId: 'calories' as TypeId,
			count: 100,
		},
	],

}

export const harvest: Recipe = {
	type: 'harvest' as RecipeId,
	input: [
		{
			typeId: 'berry' as TypeId,
			count: 10,
		},
		{
			typeId: 'tick' as TypeId,
			count: 1,
		},
	],
	output: [
		{
			typeId: 'berry' as TypeId,
			count: 10,
		}
	],
};

export const canPineApple: Recipe = {
	type: 'canPineApple' as RecipeId,
	input: [
		{
			typeId: 'calories' as TypeId,
			count: 5,
		},
		{
			typeId: 'pineApple' as TypeId,
			count: 1,
		},
		{
			typeId: 'canBlank' as TypeId,
			count: 1,
		},
		{
			typeId: 'canningWork' as TypeId, // Non-storeable
			count: 1,
		}
	],
	output: [
		{
			typeId: 'cannedPineApple' as TypeId,
			count: 1,
		},
	],
};

export const doCanningWork : Recipe = {
	type: 'doCanningWork' as RecipeId,
	input: [
		{
			typeId: 'tick' as TypeId,
			count: 1,
		},
	],
	output: [
		{
			typeId: 'canningWork' as TypeId, // Non-storeable
			count: 1,
		}
	],
};

export const smelt: Recipe = {
	type: 'smelt' as RecipeId,
	input: [
		{
			typeId: 'ironOre' as TypeId,
			count: 4,
		},
		{
			typeId: 'tick' as TypeId,
			count: 2,
		},
		{
			typeId: 'ironIngot' as TypeId,
			count: 2,
		},
	],
	output: [
		{
			typeId: 'smeltingWork' as TypeId, // Non-storeable
			count: 5,
		},
	],
};

export const trade: Recipe = {
	type: 'trade' as RecipeId,
	input: [
		{
			typeId: 'calculation' as TypeId,
			count: 10,
		}
	],
	output: [],
};

export default {
	move,
	consume,
	harvest,
	canPineApple,
	doCanningWork,
	smelt,
	trade,
} as const;
