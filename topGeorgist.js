import store from './store.js';
import playerActions from './reducers/player';
import * as playerControls from './playerControls';
import { createStatsRow } from './playerStats';
import createItemTypes from './types';
import { initInventory } from './playerInventory';
import { initVisiting } from './visitableControls';
import transaction from './actions/transaction';

const createView = (followTgoId) => {
	const c = document.getElementById("canvas");
	const ctx = c.getContext("2d");
	store.dispatch({
		type: 'VIEW_ADD',
		view: {
			viewId: 'main',
			followTgoId,
			position: { x: 10, y: 10 },
			size: { x: c.width, y: c.height },
		}
	});
	store.dispatch({
		type: 'DEFAULT_SET_VIEW',
		viewId: 'main',
	});
}

const getPlayer = (state) => {
	const s = state ? state : store.getState();
	return s.tgos.find(tgo => tgo.tgoId === s.playerId);
}

const init = () => {
	// Player
	store.dispatch({
		type: 'TGO_ADD',
		tgo: {
			tgoId: 'jesh',
			position: {x: 5, y: 5},
			color: 'red',
			inventory: [
				{
					typeId: 'calories',
					count: 2000,
				},
				{
					typeId: 'money',
					count: 500,
				},
				{
					typeId: 'pineApple',
					count: 10,
				},
			],
		}
	});
	store.dispatch({
		type: 'DEFAULT_SET_PLAYER',
		tgoId: 'jesh',
	});

	// General store
	store.dispatch({
		type: 'TGO_ADD',
		tgo: {
			tgoId: 'genStore',
			position: { x: 10, y: 7},
			color: 'pink',
			visitable: {
				lable: 'First Store',
				actions: [
					{
						label: 'buyPineapple',
						onClick: (sellerTgoId, buyerTgoId) => {
//							const buyer = store.getState().tgos.find(tgo => tgo.tgoId === buyerTgoId);
							store.dispatch({
								type: 'TGO_INVENTORY_ADD',
								tgoId: buyerTgoId,
								item: {
									typeId: 'money',
									count: -20,
								},
							});
							store.dispatch({
								type: 'TGO_INVENTORY_ADD',
								tgoId: buyerTgoId,
								item: {
									typeId: 'pineApple',
									count: +1,
								},
							});
						}
					},
					{
						label: 'sellPineapple',
						onClick: (buyerTgoId, sellerTgoId) => {
							store.dispatch(transaction(
								{
									tgoId: buyerTgoId,
									items: [
										{
											typeId: 'pineApple',
											count: +1,
										},
										{
											typeId: 'money',
											count: -10,
										},
									],
								},
								{
									tgoId: sellerTgoId,
									items: [
										{
											typeId: 'pineApple',
											count: -1,
										},
										{
											typeId: 'money',
											count: +10,
										},
									],
								},
							));
						}
					}
				],
			}
		},
	});

	store.dispatch({
		type: 'TILESET_ADD',
		tileSet: {
			tileSetId: 'basic',
			tiles: [
				{ tileId: 0, fillStyle: 'cyan', },
				{ tileId: 1, fillStyle: 'green', },
			]
		}
	});

	createItemTypes();

	initInventory('jesh');
	
	createView('jesh');
	initVisiting('main');

	drawView();
	setInterval(drawView, 100);
	setInterval(tick, 250);

	const moveRight = document.createElement('button');
	moveRight.textContent = 'moveRight';
	moveRight.onclick = playerControls.movePlayerRight;
	document.getElementById('controls').appendChild(moveRight);

	// createStatsRow('Calories', state => getPlayer(state).calories);
	createStatsRow('Pos', state => getPlayer(state).position, pos => `x:${pos.x} y:${pos.y}`);
	createStatsRow('MovPos', state => getPlayer(state).moveTarget, pos => `x:${pos.x} y:${pos.y}`);

	const c = document.getElementById("canvas");
	c.addEventListener('click', (click) => {
		const s = store.getState();
		const v = s.views.find(v => v.viewId === s.defaultViewId);
		if (!v) return;
		const { map } = s;
		const { minTile, offset } = getViewMetrics(s.defaultViewId);
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
			tgoId: 'jesh',
			moveTarget: mappedCoords,
		});
		console.log('canvas clicked.', mappedCoords)
	});
	
};

const drawCross = (pos, size = {x: 10, y: 10}, strokeStyle = 'black') => {
	const c = document.getElementById("canvas");
	const ctx = c.getContext("2d");
	ctx.beginPath();
	ctx.strokeStyle = strokeStyle;
	ctx.moveTo(pos.x - size.x/2, pos.y - size.y/2);
	ctx.lineTo(pos.x + size.x/2, pos.y + size.y/2);
	ctx.stroke();
	ctx.moveTo(pos.x - size.x/2, pos.y + size.y/2);
	ctx.lineTo(pos.x + size.x/2, pos.y - size.y/2);
	ctx.stroke();
};	

const drawTile = (pos, tile, tileSize) => {
	const c = document.getElementById("canvas");
	const ctx = c.getContext("2d");
	ctx.fillStyle = tile ? tile.fillStyle : 'grey';
	// ctx.fillStyle = `#${(Math.random()*0xFFFFFF<<0).toString(16)}`;
	ctx.fillRect(pos.x - tileSize / 2, pos.y - tileSize / 2,
		tileSize, tileSize);
}

const getViewMetrics = (viewId) => {
	const s = store.getState();
	const v = s.views.find(v => v.viewId === viewId);
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

const drawView = (viewId) => {
	const s = store.getState();
	const usedViewId = (viewId !== undefined) ? viewId : s.defaultViewId;
	const v = s.views.find(v => v.viewId === usedViewId);
	if (!v) return;

	const { map } = store.getState();
	const { minTile, maxTile, offset } = getViewMetrics(usedViewId);

	const tileSet = store.getState().tileSets.find(ts => ts.tileSetId === map.tileSetId);
	for (let y = minTile.y; y < maxTile.y; y++)
		for (let x = minTile.x; x < maxTile.x; x++) {
			drawTile({
				x: map.tileSize * (x - minTile.x + offset.x + 0.5),
				y: map.tileSize * (y - minTile.y + offset.y + 0.5)
			},
			tileSet.tiles.find(t => t.tileId === map.data[map.size.x * y + x]),
			map.tileSize);
		}

	store.getState().tgos.forEach((p) => {
		drawCross(
			{ x: (p.position.x - minTile.x + offset.x + 0.5)*map.tileSize, y: (p.position.y - minTile.y + offset.y + 0.5)*map.tileSize, },
			undefined, p.color);
	})
};

const tick = () => {
	const oldState = store.getState();
	const newActions = oldState.tgos.map(tgo => {
		const actions = [];
		if (tgo.moveTarget) {
			if ((tgo.moveTarget.x === tgo.position.x) &&
				(tgo.moveTarget.y === tgo.position.y)) {
				actions.push({
					type: 'PLAYER_SET_MOVE_TARGET',
					tgoId: tgo.tgoId,
					moveTarget: undefined,
				});
			} else {
				if  (tgo.inventory) {
					const cals = tgo.inventory.find(ii => ii.typeId === 'calories');
					if (cals && cals.count > 0)
					actions.push({
						type: 'TGO_SET_POSITION',
						tgoId: tgo.tgoId,
						position: {
							x: tgo.position.x + Math.sign(tgo.moveTarget.x - tgo.position.x),
							y: tgo.position.y + Math.sign(tgo.moveTarget.y - tgo.position.y),
						},
					});
					actions.push({
						type: 'TGO_INVENTORY_ADD',
						tgoId: tgo.tgoId,
						item: {
							typeId: 'calories',
							count: -10,
						},
					});
				}
			}
		}
		if  (tgo.inventory) {
			const cals = tgo.inventory.find(ii => ii.typeId === 'calories');
			if (cals && cals.count > 0) {
				actions.push({
					type: 'TGO_INVENTORY_ADD',
					tgoId: tgo.tgoId,
					item: {
						typeId: 'calories',
						count: -1,
					},
				});
			}
		}
		return actions;
	})
		.reduce((acc, actions) => acc.concat(actions));
	newActions.forEach(a => store.dispatch(a));
}

window.onload = init;

export default {};
