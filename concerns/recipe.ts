import type { Opaque } from '../typings/global.d.ts';

import { type Inventory } from '../concerns/inventory.ts';

export type RecipeId = Opaque<string, 'RecipeId'>

export type Recipe = {
	readonly type: RecipeId,
	readonly input: Inventory,
	readonly output: Inventory,
};
