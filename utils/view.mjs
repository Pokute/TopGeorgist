const getMetrics = (view, tgos, map) => {
	if (!view) throw new TypeError('Undefined view');
	const followTgo = view.followTgoId
		? tgos[view.followTgoId]
		: undefined;
	const pos = followTgo ? followTgo.position : view.position;
	const c = document.getElementById(view.canvasId);
	const size = {
		x: c.width,
		y: c.height,
	};

	const min = {
		x: Math.round(pos.x * map.tileSize - size.x/2),
		y: Math.round(pos.y * map.tileSize - size.y/2),
	};
	const max = {
		x: Math.round(pos.x * map.tileSize + size.x/2),
		y: Math.round(pos.y * map.tileSize + size.y/2),
	};
	const minTile = {
		x: Math.max(0, Math.trunc(min.x / map.tileSize)),
		y: Math.max(0, Math.trunc(min.y / map.tileSize)),
	};
	const maxTile = {
		x: Math.min(map.size.x, Math.trunc(max.x / map.tileSize)),
		y: Math.min(map.size.y, Math.trunc(max.y / map.tileSize)),
	};

	const offset = {
		x: min.x - Math.trunc(min.x),
		y: min.y - Math.trunc(min.y),
	};

	return {
		minTile,
		maxTile,
		offset,
	};
};

export { getMetrics };
