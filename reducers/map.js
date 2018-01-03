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

export default (state = fillMapData(undefined, () => { return Math.trunc(2 * Math.random());}), action) => {
	switch (action.type) {
		default:
			return state;
	}
};
