import randomJs from 'random-js';

const initialState = {
	seed: undefined,
	size: { x: 0, y: 0 },
	tileSize: 40,
	tileSetId: 'basic',
	data: []
};

const defaultSettings = {
	size: { x: 20, y: 20 },
	minTileId: 0,
	maxTileId: 2,
};

const fillMapData = (usedSettings, fillWith = 0) => ({
	...usedSettings,
	data: (typeof(fillWith) !== 'function') ?
		Array(usedSettings.size.x * usedSettings.size.y)
			.fill(fillWith, 0, usedSettings.size.x * usedSettings.size.y) :
		Array(usedSettings.size.x * usedSettings.size.y)
			.fill(0, 0, usedSettings.size.x * usedSettings.size.y)
			.map(t => fillWith()),
});

export default (state = initialState, action) => {
	switch (action.type) {
		case 'MAP_GENERATE':
			const mt = randomJs.engines.mt19937();
			mt.seed(action.settings.seed);
			const usedSettings = { ...defaultSettings, ...action.settings };
			return {
				...initialState,
				...fillMapData(usedSettings, () => randomJs.integer(usedSettings.minTileId, usedSettings.maxTileId)(mt)),
			}
		case 'MAP_SET':
			return action.mapState;
		default:
			return state;
	}
};
