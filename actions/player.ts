import { createAction } from 'typesafe-actions';
import { AccountId } from '../reducers/account.js';

export const playerRequest = createAction('PLAYER_CREATE_REQUEST',
	({ accountId, label }: { accountId: AccountId, label: string }) => ({
		accountId,
		label,
	})
)();

export const playerRequestServer = createAction('PLAYER_CREATE_REQUEST_SERVER',
	({ accountId, label, clientId }: { accountId: AccountId, label: string, clientId: string }) => ({
		accountId,
		label,
		clientId,
	})
)();

export const clientPlayerCreate = createAction('PLAYER_CREATE_CLIENT',
	({ label }: { label: string }) => ({
		label,
	})
)();
