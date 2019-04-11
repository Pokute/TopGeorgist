import { ActionType, getType } from 'typesafe-actions';

import * as workInstanceActions from '../actions/workInstance';
import { Inventory } from './inventory';

export interface WorkInstance {
	readonly inputProgress: Inventory,
};

export const initialState: WorkInstance = {
	inputProgress: [],
};

export type WorkInstanceActionType = ActionType<typeof workInstanceActions>;
export const WorkInstanceActionList = [
	workInstanceActions.createFromWork,
];

export default (state: WorkInstance = initialState, action: WorkInstanceActionType): WorkInstance => {
	switch (action.type) {
		case getType(workInstanceActions.createFromWork):
			return {
				...state,
				// moveTarget: action.payload.position,
			};
		default:
			return state;
	}
};
