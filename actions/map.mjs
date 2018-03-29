import randomJs from 'random-js';

export const generate = settings => ({
	type: 'MAP_GENERATE',
	settings: {
		seed: randomJs.int32(randomJs.engines.nativeMath),
		...settings,
	},
});

export const set = mapState => ({
	type: 'MAP_SET',
	mapState,
});
