import forge from 'node-forge';
import { createAction } from 'typesafe-actions';
import { v4 as uuidv4 } from 'uuid';

import { AccountId, Token, AccountType } from '../reducers/account.js';
import { TgoId } from '../reducers/tgo.js';
import serverConfig from '../serverConfig.js';

export const serverSaltPassword = (username: string, clientSaltedPassword: string) => {;
	const md = forge.md.sha512.create();
	md.update(`${serverConfig.serverSalt}${username}${clientSaltedPassword}`);
	return md.digest().toHex();
};

export const setPlayerTgoId = createAction('ACCOUNT_SET_PLAYER_TGO_ID',
	({ accountId, playerTgoId }: { accountId: AccountId, playerTgoId: TgoId }) => ({
		accountId,
		playerTgoId,
	})
)();

export const createToken = createAction('ACCOUNT_CREATE_TOKEN',
	({ accountId }: { accountId: AccountId }) => ({
		accountId,
		token: uuidv4(),
	})
)();

export const deleteToken = createAction('ACCOUNT_DELETE_TOKEN',
	({ accountId, token }: { accountId: AccountId, token: Token }) => ({
		accountId,
		token,
	})
)();

export const upgradeAccount = createAction('ACCOUNT_UPGRADE',
	({ accountId, username, clientSaltedPassword }: { accountId: AccountId, username: AccountType['username'], clientSaltedPassword: AccountType['clientAndServerSaltedPassword'] }) => ({
		accountId,
		username,
		clientAndServerSaltedPassword: serverSaltPassword(username, clientSaltedPassword),
	})
)();

export const changePassword = createAction('ACCOUNT_CHANGE_PASSWORD',
	({ accountId, username, clientSaltedPassword, clientSaltedOldPassword }: { accountId: AccountId, username: AccountType['username'], clientSaltedPassword: AccountType['clientAndServerSaltedPassword'], clientSaltedOldPassword: AccountType['clientAndServerSaltedPassword'] }) => ({
		accountId,
		clientAndServerSaltedPassword: serverSaltPassword(username, clientSaltedPassword),
		clientAndServerSaltedOldPassword:  serverSaltPassword(username, clientSaltedOldPassword),
	})
)();
