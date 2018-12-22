import { createAction } from 'typesafe-actions';
import forge from 'node-forge';

import { Token, AccountType } from '../reducers/account';

const saltPassword = (username: string, password: string) => {
	const clientSalt = 'TGCSalt-';
	const md = forge.md.sha512.create();
	md.update(`${clientSalt}${username}${password}`);
	return md.digest().toHex();
};

export const loginClientSalted = createAction('ACCOUNT_LOGIN_SALTED', resolve => {
	return ({ username, password }: { username: AccountType['username'], password: AccountType['clientSaltedPassword'] }) => resolve({
		username,
		clientSaltedPassword: saltPassword(username, password),
	});
});

export const loginWithToken = createAction('ACCOUNT_LOGIN_WITH_TOKEN', resolve => {
	return ({ token }: { token: Token }) => resolve({
		token,
	});
});

export const createAccountWithTokenClientSalted = createAction('ACCOUNT_CREATE_WITH_TOKEN', resolve => {
	return ({ username, password, token }: { username: AccountType['username'], password: AccountType['clientSaltedPassword'], token: Token }) => resolve({
		username,
		clientSaltedPassword: saltPassword(username, password),
		token,
	});
});

export const requestChangePasswordClientSalted = createAction('ACCOUNT_REQUEST_CHANGE_PASSWORD', resolve => {
	return ({ username, password, oldPassword }: { username: AccountType['username'], password: AccountType['clientSaltedPassword'], oldPassword: AccountType['clientSaltedPassword'] }) => resolve({
		username,
		clientSaltedPassword: saltPassword(username, password),
		clientSaltedOldPassword: saltPassword(username, oldPassword),
	});
});
