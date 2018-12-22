import { createAction } from 'typesafe-actions';

import { Token, AccountType } from '../reducers/account';

export const login = createAction('ACCOUNT_LOGIN', resolve => {
	return ({ username, password }: { username: AccountType['username'], password: AccountType['password'] }) => resolve({
		username,
		password,
	});
});

export const loginWithToken = createAction('ACCOUNT_LOGIN_WITH_TOKEN', resolve => {
	return ({ token }: { token: Token }) => resolve({
		token,
	});
});

export const createAccountWithToken = createAction('ACCOUNT_CREATE_WITH_TOKEN', resolve => {
	return ({ username, password, token }: { username: AccountType['username'], password: AccountType['password'], token: Token }) => resolve({
		username,
		password,
		token,
	});
});
