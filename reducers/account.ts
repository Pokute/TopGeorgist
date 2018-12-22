import { AnyAction } from "redux";
import { v4 as uuidv4 } from 'uuid';

import * as accountActions from '../actions/account';
import { AccountsState } from "./accounts";
import { TgoId } from "./tgo";
import { Omit } from "react-redux";
import { getType, ActionType } from "typesafe-actions";

export type AccountId = keyof AccountsState;
export type Token = string;
export interface extendedSocket extends WebSocket {
	sendAction(action:AnyAction): void,
};

export interface AccountType {
	readonly accountId: AccountId,
	readonly playerTgoId: TgoId,
	readonly username: string,
	readonly password: string,
	readonly tokens: Token[],
};

export const accountActionList = [
	accountActions.setPlayerTgoId,
	accountActions.createToken,
	accountActions.deleteToken,
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
		default:
			return state;
	}
};
