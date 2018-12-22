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
	return ({ accountId, username, password }: { accountId: AccountId, username: AccountType['username'], password: AccountType['password'] }) => resolve({
		accountId,
		username,
		password,
	});
});

export const changePassword = createAction('ACCOUNT_CHANGE_PASSWORD', resolve => {
	return ({ accountId, password, oldPassword }: { accountId: AccountId, password: AccountType['password'], oldPassword: AccountType['password'] }) => resolve({
		accountId,
		password,
		oldPassword,
	});
});
