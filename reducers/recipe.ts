import { Inventory } from '../components/inventory.js';
import { Opaque } from '../typings/global.d.js';

export type RecipeId = Opaque<string, 'RecipeId'>

export type Recipe = {
	readonly type: RecipeId,
	readonly input: Inventory,
	readonly output: Inventory,
};
