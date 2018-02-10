export const add = client => ({
	type: 'CLIENT_ADD',
	client,
});

export const remove = clientId => ({
	type: 'CLIENT_REMOVE',
	clientId,
});
