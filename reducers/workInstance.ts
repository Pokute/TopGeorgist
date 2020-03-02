import { ActionType, getType } from 'typesafe-actions';

import * as workInstanceActions from '../actions/workInstance';
import { Inventory } from '../components/inventory';
import { Recipe } from './recipe';
import { TgoId } from './tgo';

interface WorkInstanceInitialType {
	readonly inputProgress: Inventory,
}

export interface WorkInstance {
	readonly recipe: Recipe,
	readonly targetTgoId?: TgoId,
	readonly inputProgress: Inventory,
};

export const initialState: WorkInstanceInitialType = {
	inputProgress: [],
};

export type WorkInstanceActionType = ActionType<typeof workInstanceActions>;
export const WorkInstanceActionList = [
	workInstanceActions.createFromRecipe,
];

export default (state: WorkInstance, action: WorkInstanceActionType): WorkInstance => {
	switch (action.type) {
		case getType(workInstanceActions.createFromRecipe):
			return {
				...initialState,
				recipe: action.payload.recipe,
			};
		default:
			return state;
	}
};
