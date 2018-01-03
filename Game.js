import store from './store.js';

const drawLine = () => {
	const c = document.getElementById("canvas");
	const ctx = c.getContext("2d");
	ctx.moveTo(0,0);
	ctx.lineTo(50,300);
	ctx.stroke();
};

const init = () => {
	drawLine();
}

window.onload = init;

export default {};
