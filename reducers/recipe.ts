import { Inventory } from "../components/inventory";
import { Opaque } from '../typings/global.d';

export type RecipeId = Opaque<string, 'RecipeId'>

export type Recipe = {
	readonly type: RecipeId,
	readonly input: Inventory,
	readonly output: Inventory,
};
