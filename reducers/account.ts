import { AnyAction } from "redux";
import { v4 as uuidv4 } from 'uuid';

import * as accountActions from '../actions/account.js';
import { AccountsState } from './accounts.js';
import { TgoId } from './tgo.js';
import { Omit } from "react-redux";
import { getType, ActionType } from "typesafe-actions";
import { Opaque } from '../typings/global.d.js';

export type AccountId = Opaque<string, 'AccountId'>;
export type Token = string;
export interface extendedSocket extends WebSocket {
	sendAction(action:AnyAction): void,
};

export interface AccountType {
	readonly accountId: AccountId,
	readonly playerTgoId: TgoId,
	readonly username: string,
	readonly clientAndServerSaltedPassword: string,
	readonly tokens: ReadonlyArray<Token>,
};

export const accountActionList = [
	accountActions.setPlayerTgoId,
	accountActions.createToken,
	accountActions.deleteToken,
	accountActions.upgradeAccount,
	accountActions.changePassword,
];

type AccountAction = ActionType<typeof accountActions>;

export type AccountTypePartial = Omit<AccountType, 'accountId'>;

export default (state: AccountType, action: AnyAction): AccountType => {
	switch (action.type) {
		case getType(accountActions.setPlayerTgoId):
			return {
				...state,
				playerTgoId: action.payload.playerTgoId,
			};
		case getType(accountActions.createToken):
			return {
				...state,
				tokens: [
					...state.tokens,
					action.payload.token,
				]
			};
		case getType(accountActions.setPlayerTgoId):
			return {
				...state,
				tokens: state.tokens.filter(token => token !== action.payload.token)
			};
		case getType(accountActions.upgradeAccount):
			if (state.username !== '') {
				// Already upgraded.
				return state;
			}
			return {
				...state,
				username: action.payload.username,
				clientAndServerSaltedPassword: action.payload.clientAndServerSaltedPassword,
			};
		case getType(accountActions.changePassword):
			if (state.clientAndServerSaltedPassword !== action.payload.oldPassword) {
				return state;
			}
			return {
				...state,
				clientAndServerSaltedPassword: action.payload.password,
			};
		default:
			return state;
	}
};
