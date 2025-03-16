import { createAction } from 'typesafe-actions';
import { type TgoId } from '../reducers/tgo.ts';
import { type ViewId } from '../reducers/view.ts';
import { type AccountId, type Token } from '../concerns/account.ts';

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
