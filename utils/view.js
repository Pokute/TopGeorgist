import store from '../store.js';

const getMetrics = (viewId) => {
	const s = store.getState();
	const v = s.views.find(v => v.viewId === viewId);
	if (!v) throw new TypeError('Undefined viewId');
	const followTgo = v.followTgoId
		? s.tgos.find(tgo => tgo.tgoId === v.followTgoId)
		: undefined;
	const pos = followTgo ? followTgo.position : v.position;

	const { map } = store.getState();
	const min = {
		x: Math.round(pos.x * map.tileSize - v.size.x/2),
		y: Math.round(pos.y * map.tileSize - v.size.y/2),
	};
	const max = {
		x: Math.round(pos.x * map.tileSize + v.size.x/2),
		y: Math.round(pos.y * map.tileSize + v.size.y/2),
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
}

export { getMetrics };
