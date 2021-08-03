import { createAction } from 'typesafe-actions';
import { TgoId } from '../reducers/tgo.js';
import { ViewId } from '../reducers/view.js';
import { AccountId, Token } from '../concerns/account.js';

export const setAccountId = createAction('DEFAULTS_SET_ACCOUNT',
	(accountId: AccountId, token: Token) => ({
		accountId,
		token,
	})
)();

export const setPlayerTgoId = createAction('DEFAULTS_SET_PLAYER',
	(playerTgoId: TgoId) => ({
		playerTgoId,
	})
)();

export const setViewId = createAction('DEFAULTS_SET_VIEW',
	(viewId: ViewId) => ({
		viewId,
	})
)();
