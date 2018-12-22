import { createAction } from 'typesafe-actions';
import { v4 as uuidv4 } from 'uuid';

import { AccountId, AccountTypePartial } from '../reducers/account';

export const add = createAction('ACCOUNT_ADD', (resolve) => {
	return (account: AccountTypePartial) => resolve({
		account: {
			...account,
			accountId: uuidv4(),
		},
	});
});

export const remove = createAction('ACCOUNT_REMOVE', (resolve) => {
	return (accountId: AccountId) => resolve({
		accountId: accountId,
	});
});

export const accountRequest = createAction('ACCOUNT_CREATE_REQUEST', resolve => {
	return ({ username, password }: { username: string, password: string }) => resolve({
		username,
		password,
	});
});

export const accountRequestWithClient = createAction('ACCOUNT_CREATE_REQUEST_WITH_CLIENT', resolve => {
	return ({ clientId, username, password }: { clientId: string, username: string, password: string }) => resolve({
		clientId,
		username,
		password,
	});
});
