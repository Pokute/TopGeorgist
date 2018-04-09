import uuidv4 from 'uuid';

export const add = tgo => ({
	type: 'TGO_ADD',
	tgo: {
		...tgo,
		tgoId: uuidv4(),
	},
});

export const set = tgosState => ({
	type: 'TGOS_SET',
	tgosState,
});
