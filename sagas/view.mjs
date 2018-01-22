import { put, select, takeEvery } from 'redux-saga/effects';
import * as inventoryActions from '../actions/inventory';
import * as viewUtils from '../utils/view';

const drawTile = (ctx, pos, tile, tileSize) => {
	ctx.fillStyle = tile ? tile.fillStyle : 'grey';
	// ctx.fillStyle = `#${(Math.random()*0xFFFFFF<<0).toString(16)}`;
	ctx.fillRect(pos.x - tileSize / 2, pos.y - tileSize / 2,
		tileSize, tileSize);
}

const drawCross = (ctx, pos, size = {x: 10, y: 10}, strokeStyle = 'black') => {
	ctx.beginPath();
	ctx.strokeStyle = strokeStyle;
	ctx.moveTo(pos.x - size.x/2, pos.y - size.y/2);
	ctx.lineTo(pos.x + size.x/2, pos.y + size.y/2);
	ctx.stroke();
	ctx.moveTo(pos.x - size.x/2, pos.y + size.y/2);
	ctx.lineTo(pos.x + size.x/2, pos.y - size.y/2);
	ctx.stroke();
};	

const render = function* (action) {
	const { viewId } = action;
	const s = yield select((s) => s);
	const usedViewId = (viewId !== undefined) ? viewId : s.defaults.viewId;
	const v = s.views.find(v => v.viewId === usedViewId);
	if (!v) return;

	const { minTile, maxTile, offset } = viewUtils.getMetrics(usedViewId);

	const ctx = v.canvas.getContext("2d");
	const tileSet = s.tileSets.find(ts => ts.tileSetId === s.map.tileSetId);
	for (let y = minTile.y; y < maxTile.y; y++)
		for (let x = minTile.x; x < maxTile.x; x++) {
			drawTile(ctx, {
				x: s.map.tileSize * (x - minTile.x + offset.x + 0.5),
				y: s.map.tileSize * (y - minTile.y + offset.y + 0.5)
			},
			tileSet.tiles.find(t => t.tileId === s.map.data[s.map.size.x * y + x]),
			s.map.tileSize);
		}

	s.tgos.forEach((p) => {
		drawCross(ctx,
			{ x: (p.position.x - minTile.x + offset.x + 0.5)*s.map.tileSize, y: (p.position.y - minTile.y + offset.y + 0.5)*s.map.tileSize, },
			undefined, p.color);
	})
};

const viewListener = function*() {
	yield takeEvery('VIEW_RENDER', render);
}

export default viewListener;