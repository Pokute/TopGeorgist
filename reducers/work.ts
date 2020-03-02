import { ActionType, getType } from 'typesafe-actions';

import * as workActions from '../actions/work';
import { Inventory } from '../components/inventory';
import { Recipe } from './recipe';
import { TgoId } from './tgo';

interface WorkType {
	readonly inputProgress: Inventory,
}

export interface Work {
	readonly recipe: Recipe,
	readonly targetTgoId?: TgoId,
	readonly inputProgress: Inventory,
};

export const initialState: WorkType = {
	inputProgress: [],
};

export type WorkActionType = ActionType<typeof workActions>;
export const WorkActionList = [
	workActions.createFromRecipe,
];

export default (state: Work, action: WorkActionType): Work => {
	switch (action.type) {
		case getType(workActions.createFromRecipe):
			return {
				...initialState,
				recipe: action.payload.recipe,
			};
		default:
			return state;
	}
};
