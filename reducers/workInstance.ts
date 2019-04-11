import { ActionType, getType } from 'typesafe-actions';

import * as workInstanceActions from '../actions/workInstance';
import { Inventory } from './inventory';
import { Work } from './work';

interface WorkInstanceInitialType {
	readonly inputProgress: Inventory,
}

export interface WorkInstance {
	readonly work: Work,
	readonly inputProgress: Inventory,
};

export const initialState: WorkInstanceInitialType = {
	inputProgress: [],
};

export type WorkInstanceActionType = ActionType<typeof workInstanceActions>;
export const WorkInstanceActionList = [
	workInstanceActions.createFromWork,
];

export default (state: WorkInstance, action: WorkInstanceActionType): WorkInstance => {
	switch (action.type) {
		case getType(workInstanceActions.createFromWork):
			return {
				...initialState,
				work: action.payload.work,
			};
		default:
			return state;
	}
};
