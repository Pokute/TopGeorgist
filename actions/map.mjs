import randomJs from 'random-js';

export const generate = (settings) => {
	return {
		type: 'MAP_GENERATE',
		settings: {
			seed: randomJs.int32(randomJs.engines.nativeMath),
			...settings,
		},
	};
};

export const set = (mapState) => {
	return {
		type: 'MAP_SET',
		mapState,
	};
};
