import { createAction } from 'typesafe-actions';
import { v4 as uuidv4 } from 'uuid';

import { AccountId, Token, AccountType } from '../reducers/account';
import { TgoId } from '../reducers/tgo';

export const setPlayerTgoId = createAction('ACCOUNT_SET_PLAYER_TGO_ID', resolve => {
	return ({ accountId, playerTgoId }: { accountId: AccountId, playerTgoId: TgoId }) => resolve({
		accountId,
		playerTgoId,
	});
});

export const createToken = createAction('ACCOUNT_CREATE_TOKEN', resolve => {
	return ({ accountId }: { accountId: AccountId }) => resolve({
		accountId,
		token: uuidv4(),
	});
});

export const deleteToken = createAction('ACCOUNT_DELETE_TOKEN', resolve => {
	return ({ accountId, token }: { accountId: AccountId, token: Token }) => resolve({
		accountId,
		token,
	});
});

export const upgradeAccount = createAction('ACCOUNT_UPGRADE', resolve => {
	return ({ accountId, username, clientSaltedPassword }: { accountId: AccountId, username: AccountType['username'], clientSaltedPassword: AccountType['clientSaltedPassword'] }) => resolve({
		accountId,
		username,
		clientSaltedPassword,
	});
});

export const changePassword = createAction('ACCOUNT_CHANGE_PASSWORD', resolve => {
	return ({ accountId, clientSaltedPassword, clientSaltedOldPassword }: { accountId: AccountId, clientSaltedPassword: AccountType['clientSaltedPassword'], clientSaltedOldPassword: AccountType['clientSaltedPassword'] }) => resolve({
		accountId,
		clientSaltedPassword,
		clientSaltedOldPassword,
	});
});
