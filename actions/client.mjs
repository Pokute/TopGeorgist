export const add = (client) => ({
	type: 'CLIENT_ADD',
	client,
});

export const remove = client => ({
	type: 'CLIENT_REMOVE',
	client,
});
