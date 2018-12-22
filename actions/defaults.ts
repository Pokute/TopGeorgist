import { createAction } from 'typesafe-actions';
import { TgoId } from '../reducers/tgo';
import { ViewId } from '../reducers/view';
import { AccountId, Token } from '../reducers/account';

export const setAccountId = createAction('DEFAULTS_SET_ACCOUNT', (resolve) => {
	return (accountId: AccountId, token: Token) => resolve({
		accountId,
		token,
	});
});

export const setPlayerTgoId = createAction('DEFAULTS_SET_PLAYER', (resolve) => {
	return (playerTgoId: TgoId) => resolve({
		playerTgoId,
	});
});

export const setViewId = createAction('DEFAULTS_SET_VIEW', (resolve) => {
	return (viewId: ViewId) => resolve({
		viewId,
	});
});
