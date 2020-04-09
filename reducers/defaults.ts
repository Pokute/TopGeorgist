import { getType, ActionType } from 'typesafe-actions';

import { AccountId } from './account';
import * as defaultActions from '../actions/defaults';
import { TgoId } from './tgo';
import { ViewId } from './view';

export interface Type {
	readonly accountId: AccountId,
	readonly playerTgoId?: TgoId,
	readonly viewId?: ViewId,
};

export const initialState: Type = {
	accountId: '' as AccountId,
	playerTgoId: '' as TgoId,
	viewId: '' as ViewId,
};

export type DefaultsActionType = ActionType<typeof defaultActions>;

export default (state: Type = initialState, action: DefaultsActionType): Type => {
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
