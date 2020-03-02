import { createAction } from 'typesafe-actions';
import { Work } from '../reducers/work';
import { Recipe } from '../reducers/recipe';
import { TgoId } from '../reducers/tgo';

export const createFromRecipe = createAction('WORK_CREATE_FROM_RECIPE', resolve => {
	return ({ recipe }: { recipe: Recipe }) => resolve({
		recipe,
	});
});

export const createWork = createAction('WORK_CREATE', resolve => {
	return ({ goalTgoId, recipe, targetTgoId }: { goalTgoId: TgoId, recipe: Recipe, targetTgoId?: TgoId }) => resolve({
			goalTgoId,
			recipe,
			targetTgoId,
	});
});
