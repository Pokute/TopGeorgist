// Client code.

import store from './store';
import createItemTypes from './types';
import createInitialObjects from './initialObjects'
import WebSocketWrapper from 'ws-wrapper';
import * as viewActions from './actions/view';
import * as mapActions from './actions/map';

const init = () => {
	global.ws = new WebSocketWrapper(new WebSocket('ws://localhost:4320'));

	global.ws.on('message', (msg) => {
		console.log(msg);
		const d = JSON.parse(msg.data);
		console.log(d);
		if (d.map) store.dispatch(mapActions.set(d.map));
	});

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
