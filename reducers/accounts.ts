import { ActionType, getType, isActionOf } from 'typesafe-actions';

import { accountActionList, AccountId, AccountType, default as accountReducer} from './account.js';
import * as accountActions from '../actions/account.js'; 
import * as accountsActions from '../actions/accounts.js'; 

export type AccountsState = {
	readonly [extraProps: string]: AccountType;
};

const initialState: AccountsState = {};
const listActions = [
	accountsActions.add,
	accountsActions.remove,
].map(a => getType(a));

type AccountAction = ActionType<typeof accountActions>;
type AccountsAction = ActionType<typeof accountsActions>;

export default (state: AccountsState = initialState, action: AccountAction | AccountsAction) => {
	switch (action.type) {
		case getType(accountsActions.setAll):
			return action.payload.accounts;
		case getType(accountsActions.add):
			return {
				...state,
				[action.payload.account.accountId]: action.payload.account,
			};
		case getType(accountsActions.remove): {
			const { [action.payload.accountId]: undefined, ...rest } = state;
			return rest;
		}
		default:
			if (accountActionList.some(a => getType(a) === action.type)) {
				const accountAction = action as AccountAction;
				const newAccount = accountReducer(state[accountAction.payload.accountId], accountAction);
				if (newAccount !== state[accountAction.payload.accountId]) {
					return {
						...state,
						[accountAction.payload.accountId]: newAccount,
					};
				}
				return state;
			}
			return state;
	}
};
