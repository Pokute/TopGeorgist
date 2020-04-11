import forge from 'node-forge';
import { createAction } from 'typesafe-actions';

import { Token, AccountType } from '../reducers/account';

const clientSaltPassword = (username: string, password: string) => {
	const clientSalt = 'TGCSalt-';
	const md = forge.md.sha512.create();
	md.update(`${clientSalt}${username}${password}`);
	return md.digest().toHex();
};

export const loginClientSalted = createAction('ACCOUNT_LOGIN_SALTED',
	({ username, password }: { username: AccountType['username'], password: AccountType['clientAndServerSaltedPassword'] }) => ({
		username,
		clientSaltedPassword: clientSaltPassword(username, password),
	})
)();

export const loginWithToken = createAction('ACCOUNT_LOGIN_WITH_TOKEN',
	({ token }: { token: Token }) => ({
		token,
	})
)();

export const createAccountWithTokenClientSalted = createAction('ACCOUNT_CREATE_WITH_TOKEN',
	({ username, password, token }: { username: AccountType['username'], password: AccountType['clientAndServerSaltedPassword'], token: Token }) => ({
		username,
		clientSaltedPassword: clientSaltPassword(username, password),
		token,
	})
)();

export const requestChangePasswordClientSalted = createAction('ACCOUNT_REQUEST_CHANGE_PASSWORD',
	({ username, password, oldPassword }: { username: AccountType['username'], password: AccountType['clientAndServerSaltedPassword'], oldPassword: AccountType['clientAndServerSaltedPassword'] }) => ({
		username,
		clientSaltedPassword: clientSaltPassword(username, password),
		clientSaltedOldPassword: clientSaltPassword(username, oldPassword),
	})
)();
