export const add = (tgo) => ({
	type: 'TGO_ADD',
	tgo,
});

export const set = (tgosState) => {
	return {
		type: 'TGOS_SET',
		tgosState,
	};
};
