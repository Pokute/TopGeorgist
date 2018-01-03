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

const drawWorld = () => {
	store.getState().tgos.forEach((p) => {
		drawCross(p.position, undefined, p.color);
	})
};

window.onload = init;

export default {};
