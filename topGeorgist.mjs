import store from './store';
import createItemTypes from './types';
import createInitialObjects from './initialObjects'
import * as viewActions from './actions/view';
import WebSocketWrapper from 'ws-wrapper';

const init = () => {
	global.ws = new WebSocketWrapper(new WebSocket('ws://localhost:4320'));

	createItemTypes();
	createInitialObjects();

	setInterval(tick, 250);

	// View specific
	document.body.appendChild(viewActions.create('main', 'jesh', true));
	document.body.appendChild(viewActions.create('secondary', 'genStore'));

	store.dispatch(viewActions.render());
	setInterval(() => {
		store.dispatch(viewActions.render());
	}, 100);
	setInterval(() => {
		store.dispatch(viewActions.render('secondary'));
	}, 100);
};

const tick = () => {
	const oldState = store.getState();
	const newActions = oldState.tgos
		.filter(tgo => tgo.tick)
		.map(tgo => tgo.tick(tgo))
		.reduce((acc, actions) => acc.concat(actions));
	newActions.forEach(a => store.dispatch(a));
}

window.onload = init;

export default {};
