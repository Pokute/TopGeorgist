import { createAction } from 'typesafe-actions';
import { WorkInstance } from '../reducers/workInstance';
import { Recipe } from '../reducers/recipe';
import { TgoId } from '../reducers/tgo';

export const createFromRecipe = createAction('WORK_INSTANCE_CREATE_FROM_WORK', resolve => {
	return ({ recipe }: { recipe: Recipe }) => resolve({
		recipe,
	});
});

export const createWorkInstance = createAction('WORK_INSTANCE_CREATE', resolve => {
	return ({ goalTgoId, recipe, targetTgoId }: { goalTgoId: TgoId, recipe: Recipe, targetTgoId?: TgoId }) => resolve({
			goalTgoId,
			recipe,
			targetTgoId,
	});
});
