const initialSettings = {
	size: { x: 100, y: 100 },
	tileSize: 10,
	tileSetId: 'basic',
	data: []
};

const fillMapData = (usedSettings = initialSettings, fillWith = 0) => ({
	...usedSettings,
	data: (typeof(fillWith) !== 'function') ?
		Array(usedSettings.size.x * usedSettings.size.y)
			.fill(fillWith, 0, usedSettings.size.x * usedSettings.size.y) :
		Array(usedSettings.size.x * usedSettings.size.y)
			.fill(0, 0, usedSettings.size.x * usedSettings.size.y)
			.map(t => fillWith()),
});

const genRandomTiles = (maxTileNum) => (() => {
	return Math.trunc(maxTileNum * Math.random());
});

export default (state = fillMapData(undefined, genRandomTiles(3)), action) => {
	switch (action.type) {
		default:
			return state;
	}
};
