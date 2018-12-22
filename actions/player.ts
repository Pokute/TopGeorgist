import { createAction } from 'typesafe-actions';
import { AccountId } from '../reducers/account';

export const playerRequest = createAction('PLAYER_CREATE_REQUEST', resolve => {
	return ({ accountId, label }: { accountId: AccountId, label: string }) => resolve({
		accountId,
		label,
	});
});

export const playerRequestServer = createAction('PLAYER_CREATE_REQUEST_SERVER', resolve => {
	return ({ accountId, label, clientId }: { accountId: AccountId, label: string, clientId: string }) => resolve({
		accountId,
		label,
		clientId,
	});
});

export const clientPlayerCreate = createAction('PLAYER_CREATE_CLIENT', resolve => {
	return ({ label }: { label: string }) => resolve({
		label,
	});
});
