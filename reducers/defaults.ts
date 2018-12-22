import IAction from './action';
import { getType, ActionType } from 'typesafe-actions';

import { AccountId } from './account';
import * as defaultActions from '../actions/defaults';
import { TgoId } from './tgo';
import { ViewId } from './view';

export interface type {
	readonly accountId: AccountId,
	readonly playerTgoId?: TgoId,
	readonly viewId?: ViewId,
};

const initialState: type = {
	accountId: '',
	playerTgoId: '',
	viewId: '',
};

export type DefaultsActionType = ActionType<typeof defaultActions>;

export default (state: type = initialState, action: DefaultsActionType): type => {
	switch (action.type) {
		case getType(defaultActions.setAccountId):
			return {
				...state,
				accountId: action.payload.accountId,
			};
		case getType(defaultActions.setPlayerTgoId):
			return {
				...state,
				playerTgoId: action.payload.playerTgoId,
			};
		case getType(defaultActions.setViewId):
			return {
				...state,
				viewId: action.payload.viewId,
			};
		default:
			return state;
	}
};
