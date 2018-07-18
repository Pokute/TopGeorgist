import { createAction } from 'typesafe-actions';

export const playerRequest = createAction('PLAYER_CREATE_REQUEST', resolve => {
	// return ({ label }: { label: string }) => resolve({
	// 	label,
	// });
	return ({ label }: { label: string }) => resolve({
		label,
	});
});

export const playerRequestServer = createAction('PLAYER_CREATE_REQUEST_SERVER', resolve => {
	return ({ label, clientId }: { label: string, clientId: string }) => resolve({
		label,
		clientId,
	});
});
