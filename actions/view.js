import store from '../store.js';
import * as viewUtils from '../utils/view';

const setDefault = (viewId) => ({
	type: 'DEFAULTS_SET_VIEW',
	viewId,
});

const create = (canvasElement, viewId, followTgoId = undefined, setAsDefault = false) => {
	// Check for duplicate viewId.

	const c = canvasElement;
	store.dispatch({
		type: 'VIEW_ADD',
		view: {
			viewId,
			canvas: canvasElement,
			followTgoId,
			position: { x: 10, y: 10 },
			size: { x: c.width, y: c.height },
		}
	});
	if (setAsDefault) {
		store.dispatch(setDefault(viewId));
	}

	c.addEventListener('click', (click) => {
		const s = store.getState();
		const v = s.views.find(v => v.viewId === s.defaults.viewId);
		if (!v) return;
		const { map } = s;
		const { minTile, offset } = viewUtils.getMetrics(v.viewId);
		const canvasCoords = {
			x: click.offsetX,
			y: click.offsetY,
		};
		const mappedCoords = {
			x: Math.trunc(canvasCoords.x / map.tileSize + offset.x) + minTile.x,
			y: Math.trunc(canvasCoords.y / map.tileSize + offset.y) + minTile.y,
		};
		store.dispatch({
			type: 'PLAYER_SET_MOVE_TARGET',
			tgoId: v.followTgoId,
			moveTarget: mappedCoords,
		});
		console.log('canvas clicked.', mappedCoords)
	});
}


const render = (viewId) => ({
	type: 'VIEW_RENDER',
	viewId,
})

export { create, render, setDefault };
