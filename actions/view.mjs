import store from '../store';
import * as viewUtils from '../utils/view';
import { createStatsRow } from '../playerStats';
import { initInventory } from '../playerInventory';
import { initVisiting } from '../visitableControls';
import * as playerControls from '../playerControls';

const setDefault = (viewId) => ({
	type: 'DEFAULTS_SET_VIEW',
	viewId,
});

const createTable = (className, caption) => {
	const table = document.createElement('table');
	table.className = className;
	table.border = '1';
	if (caption) {
		const captionElement = document.createElement('caption');
		captionElement.textContent = caption;
		table.appendChild(captionElement);
	}
	const tBody = document.createElement('tbody');
	table.appendChild(tBody);

	return table;
}

const createHTML = (viewId) => {
	const viewTable = createTable('view')
	const viewTBody = viewTable.getElementsByTagName('tbody')[0];
	const viewRow = document.createElement('tr');
	viewTBody.appendChild(viewRow);

	const canvasCol = document.createElement('td');
	viewRow.appendChild(canvasCol);

	const canvas = document.createElement('canvas');
	canvas.width = 1000;
	canvas.height = 500;
	canvasCol.appendChild(canvas);

	const infoCol = document.createElement('td');
	viewRow.appendChild(infoCol);

	// Stats
	const stats = createTable('stats', 'Stats');
	infoCol.appendChild(stats);

	// Controls
	const controls = document.createElement('div');
	controls.className = 'controls';
	infoCol.appendChild(controls);
	const controlsTitle = document.createElement('p');
	controlsTitle.textContent = 'Controls';
	controls.appendChild(controlsTitle);

	// Inventory
	const inventory = createTable('inventory', 'Inventory');
	infoCol.appendChild(inventory);

	// Visitable
	const visitable = createTable('visitable', 'Visitable');
	infoCol.appendChild(visitable);
	return viewTable;
};

const create = (viewId, followTgoId = undefined, setAsDefault = false) => {
	// Check for duplicate viewId.

	const html = createHTML();

	// const c = canvasElement;
	const c = html.getElementsByTagName('canvas')[0];
	store.dispatch({
		type: 'VIEW_ADD',
		view: {
			viewId,
			canvas: c,
			followTgoId,
			position: { x: 10, y: 10 },
			size: { x: c.width, y: c.height },
		}
	});
	if (setAsDefault) {
		store.dispatch(setDefault(viewId));
	}

	if (followTgoId) {
		const getTgo = (state, tgoId) => {
			const s = state ? state : store.getState();
			return s.tgos.find(tgo => tgo.tgoId === tgoId);
		};

		const statsBody = html.getElementsByClassName('stats')[0];
		statsBody.appendChild(createStatsRow('Pos', state => getTgo(state, followTgoId).position, pos => `x:${pos.x} y:${pos.y}`));
		statsBody.appendChild(createStatsRow('MovPos', state => getTgo(state, followTgoId).moveTarget, pos => `x:${pos.x} y:${pos.y}`));
	}

	const moveRight = document.createElement('button');
	moveRight.textContent = 'moveRight';
	moveRight.onclick = playerControls.movePlayerRight;
	html.getElementsByClassName('controls')[0].appendChild(moveRight);

	initInventory(html.getElementsByClassName('inventory')[0], followTgoId);
	initVisiting(html.getElementsByClassName('visitable')[0], viewId);

	c.addEventListener('click', (click) => {
		const s = store.getState();
		const v = s.views.find(v => v.viewId === viewId);
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

	return html;
}


const render = (viewId) => ({
	type: 'VIEW_RENDER',
	viewId,
})

export { create, render, setDefault };
