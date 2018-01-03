import store from './store.js';
import playerActions from './reducers/player';
import { movePlayerRight } from './playerControls';

const drawLine = () => {
	const c = document.getElementById("canvas");
	const ctx = c.getContext("2d");
	ctx.moveTo(0,0);
	ctx.lineTo(50,300);
	ctx.stroke();
};

const init = () => {
	store.dispatch({
		type: 'TGO_ADD',
		tgo: {
			tgoId: 'jesh',
			position: {x: 5, y: 100},
			color: 'red',
		}
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

	drawLine();
	drawWorld();
	setInterval(drawWorld, 100);

	const moveRight = document.createElement('button');
	moveRight.textContent = 'moveRight';
	moveRight.onclick = movePlayerRight;
	document.getElementById('controls').appendChild(moveRight);
};

const drawCross = (pos, size = {x: 10, y: 10}, strokeStyle = 'black') => {
	const c = document.getElementById("canvas");
	const ctx = c.getContext("2d");
	ctx.strokeStyle = strokeStyle;
	ctx.moveTo(pos.x - size.x, pos.y - size.y);
	ctx.lineTo(pos.x + size.x, pos.y + size.y);
	ctx.stroke();
	ctx.moveTo(pos.x - size.x, pos.y + size.y);
	ctx.lineTo(pos.x + size.x, pos.y - size.y);
	ctx.stroke();
};	

const drawTile = (pos, tile, tileSize) => {
	const c = document.getElementById("canvas");
	const ctx = c.getContext("2d");
	ctx.fillStyle = tile ? tile.fillStyle : 'grey';
	ctx.fillRect(pos.x - tileSize / 2, pos.y - tileSize / 2,
		tileSize, tileSize);
}

const drawMap = () => {
	const { map } = store.getState();
	const tileSet = store.getState().tileSets.find(ts => ts.tileSetId === map.tileSetId);
	for (let y = 0; y < map.size.y; y++)
		for (let x = 0; x < map.size.x; x++) {
			drawTile({ x: map.tileSize * (x + 0.5), y: map.tileSize * (y + 0.5) },
				 tileSet.tiles.find(t => t.tileId === map.data[map.size.x * y + x]),
				 map.tileSize);
		}
}

const drawWorld = () => {
	drawMap();
	store.getState().tgos.forEach((p) => {
		drawCross(p.position, undefined, p.color);
	})
};

window.onload = init;

export default {};
