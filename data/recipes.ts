import { Recipe, RecipeId } from '../concerns/recipe.js';
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

export const digestHydrocarbons = {
	type: 'digestHydrocarbons' as RecipeId,
	input: [
		{
			typeId: 'hydrocarbons' as TypeId,
			count: 100,
		},
		{
			typeId: 'tick' as TypeId,
			count: 5,
		},
	],
	output: [
		{
			typeId: 'calories' as TypeId,
			count: 100,
		},
	],
};

export const growPineapple: Recipe = {
	type: 'growPineapple' as RecipeId,
	input: [
		{
			typeId: 'growthPotential' as TypeId,
			count: 1/256,
		},
		{
			typeId: 'tick' as TypeId,
			count: 10,
		},
	],
	output: [
		{
			typeId: 'pineApple' as TypeId,
			count: 1/256,
		}
	],
};

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
			typeId: 'canningWork' as TypeId,
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
			count: 8,
		},
		{
			typeId: 'calories' as TypeId,
			count: 12,
		},
		{
			typeId: 'canneryTool' as TypeId,
			count: 1,
		},
	],
	output: [
		{
			typeId: 'canningWork' as TypeId,
			count: 1,
		},
	],
};

export const provideCanneryTool : Recipe = {
	type: 'provideCanneryTool' as RecipeId,
	input: [
		{
			typeId: 'tick' as TypeId,
			count: 1,
		},
	],
	output: [
		{
			typeId: 'canneryTool' as TypeId,
			count: 1,
		},
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

export const calculation: Recipe = {
	type: 'calculation' as RecipeId,
	input: [
		{
			typeId: 'tick' as TypeId,
			count: 3,
		},
		{
			typeId: 'calories' as TypeId,
			count: 4,
		},
	],
	output: [
		{
			typeId: 'calculation' as TypeId,
			count: 1,
		},
	],
};

export const trade: Recipe = {
	type: 'trade' as RecipeId,
	input: [
		{
			typeId: 'calculation' as TypeId,
			count: 10,
		},
	],
	output: [
		{
			typeId: 'trade' as TypeId,
			count: 1,
		},
	],
};

const recipes: Record<RecipeId, Recipe> = {
	[move.type]: move,
	[digestHydrocarbons.type]: digestHydrocarbons,
	[growPineapple.type]: growPineapple,
	[harvest.type]: harvest,
	[canPineApple.type]: canPineApple,
	[doCanningWork.type]: doCanningWork,
	[smelt.type]: smelt,
	[calculation.type]: calculation,
	[trade.type]: trade,
} as const;

export default recipes;
