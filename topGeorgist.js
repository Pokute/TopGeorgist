import store from './store.js';
import playerActions from './reducers/player';
import { movePlayerRight } from './playerControls';
import { createStatsRow } from './playerStats';

const init = () => {
	// Player
	store.dispatch({
		type: 'TGO_ADD',
		tgo: {
			tgoId: 'jesh',
			position: {x: 5, y: 5},
			calories: 2000,
			money: 100,
			color: 'red',
		}
	});

	// General store
	store.dispatch({
		type: 'TGO_ADD',
		tgo: {
			tgoId: 'genStore',
			position: { x: 10, y: 7},
			color: 'pink',
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

	drawWorld();
	setInterval(drawWorld, 100);
	setInterval(tick, 250);

	const moveRight = document.createElement('button');
	moveRight.textContent = 'moveRight';
	moveRight.onclick = movePlayerRight;
	document.getElementById('controls').appendChild(moveRight);

	createStatsRow('Calories', state => state.tgos[0].calories);
	createStatsRow('Money', state => state.tgos[0].money);
	createStatsRow('Pos', state => state.tgos[0].position, pos => `x:${pos.x} y:${pos.y}`);
	createStatsRow('MovPos', state => state.tgos[0].moveTarget, pos => `x:${pos.x} y:${pos.y}`);

	const c = document.getElementById("canvas");
	c.addEventListener('click', (click) => {
		const { map } = store.getState();
		const mappedCoords = {
			x: Math.trunc((click.x - click.target.offsetLeft) / map.tileSize),
			y: Math.trunc((click.y - click.target.offsetTop) / map.tileSize),
		};
		store.dispatch({ 
			type: 'PLAYER_SET_MOVE_TARGET',
			tgoId: 'jesh',
			moveTarget: mappedCoords,
		});
		console.log('canvas clicked.', click)
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

const drawView = () => {

};

const drawMap = () => {
	const s = store.getState();
	const { map } = store.getState();
	const tileSet = store.getState().tileSets.find(ts => ts.tileSetId === map.tileSetId);
	for (let y = 0; y < 10; y++)
		for (let x = 0; x < 10; x++) {
	// for (let y = 0; y < map.size.y; y++)
		// for (let x = 0; x < map.size.x; x++) {
				drawTile({ x: map.tileSize * (x + 0.5), y: map.tileSize * (y + 0.5) },
				 tileSet.tiles.find(t => t.tileId === map.data[map.size.x * y + x]),
				 map.tileSize);
		}
};

const drawWorld = () => {
	drawMap();
	const { map } = store.getState();
	store.getState().tgos.forEach((p) => {
		drawCross(
			{ x: (p.position.x + 0.5)*map.tileSize, y: (p.position.y + 0.5)*map.tileSize, },
			undefined, p.color);
	})
};

const tick = () => {
	const oldState = store.getState();
	const newActions = oldState.tgos.map(tgo => {
		const actions = [];
		if (tgo.moveTarget) {
			if ((tgo.moveTarget.x === tgo.position.x) &&
				(tgo.moveTarget.x === tgo.position.x)) {
				actions.push({
					type: 'PLAYER_SET_MOVE_TARGET',
					tgoId: tgo.tgoId,
					moveTarget: undefined,
				});
			} else {
				if (tgo.calories && tgo.calories > 0)
				actions.push({
					type: 'TGO_SET_POSITION',
					tgoId: tgo.tgoId,
					position: {
						x: tgo.position.x + Math.sign(tgo.moveTarget.x - tgo.position.x),
						y: tgo.position.y + Math.sign(tgo.moveTarget.y - tgo.position.y),
					},
				});
				actions.push({
					type: 'PLAYER_ADD_CALORIES',
					tgoId: tgo.tgoId,
					dCalories: -10,
				});
			}
		}
		actions.push({
			type: 'PLAYER_ADD_CALORIES',
			tgoId: tgo.tgoId,
			dCalories: -1,
		});
		return actions;
	})
		.reduce((acc, actions) => acc.concat(actions));
	newActions.forEach(a => store.dispatch(a));
}

window.onload = init;

export default {};
