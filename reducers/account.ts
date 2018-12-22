import { AnyAction } from "redux";

import * as accountActions from '../actions/account';
import { AccountsState } from "./accounts";
import { TgoId } from "./tgo";
import { Omit } from "react-redux";
import { getType, ActionType } from "typesafe-actions";

export type AccountId = keyof AccountsState;
export interface extendedSocket extends WebSocket {
	sendAction(action:AnyAction): void,
};

export interface AccountType {
	readonly accountId: AccountId,
	readonly playerTgoId: TgoId,
	readonly username: string,
	readonly password: string,
};

export const accountActionList = [
	accountActions.setPlayerTgoId,
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
		default:
			return state;
	}
};
