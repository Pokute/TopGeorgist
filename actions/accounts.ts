import { createAction } from 'typesafe-actions';
import { v4 as uuidv4 } from 'uuid';

import { AccountId, AccountTypePartial } from '../reducers/account.js';
import { AccountsState } from '../reducers/accounts.js';

export const setAll = createAction('ACCOUNT_SET',
	(accounts: AccountsState) => ({
		accounts,
	})
)();

export const add = createAction('ACCOUNT_ADD',
	(account: AccountTypePartial) => ({
		account: {
			...account,
			accountId: uuidv4() as AccountId,
		},
	})
)();

export const remove = createAction('ACCOUNT_REMOVE',
	(accountId: AccountId) => ({
		accountId: accountId,
	})
)();

export const accountRequest = createAction('ACCOUNT_CREATE_REQUEST',
	({ username, password }: { username: string, password: string }) => ({
		username,
		password,
	})
)();

export const accountRequestWithClient = createAction('ACCOUNT_CREATE_REQUEST_WITH_CLIENT',
	({ clientId, username, password }: { clientId: string, username: string, password: string }) => ({
		clientId,
		username,
		password,
	})
)();
