// Client code.

import store from './store';
import createItemTypes from './types';
import createInitialObjects from './initialObjects'
import WebSocketWrapper from 'ws-wrapper';
import * as viewActions from './actions/view';
import * as mapActions from './actions/map';
import * as tileSetActions from './actions/tileSet';
import * as tgoActions from './actions/tgo';
import components from './components';

const init = () => {
	global.ws = new WebSocketWrapper(new WebSocket('ws://localhost:4320'));

	global.ws.on('message', (msg) => {
		const data = JSON.parse(msg.data);
		if (data && data.action && data.action.type === 'ALL_SET') {
			const newState = data.action.data;
			if (newState.map) store.dispatch(mapActions.set(newState.map));
			if (newState.tileSets) store.dispatch(tileSetActions.set(newState.tileSets));
			if (newState.tgos) store.dispatch(tgoActions.set(newState.tgos));
		} else if (data && data.action && data.action.type === 'DEFAULTS_SET_PLAYER') {
			store.dispatch(data.action);
			store.dispatch(viewActions.setFollowTarget('main', data.action.playerTgoId));
		}
	});

	createItemTypes();

	if (global.isServer) setInterval(tick, 250);
	// setInterval(tick, 250);

	store.dispatch(viewActions.render());
	setInterval(() => {
		store.dispatch(viewActions.render());
	}, 100);
	setInterval(() => {
		store.dispatch(viewActions.render('secondary'));
	}, 100);
};

export const tick = () => {
	const oldState = store.getState();
	const comp = components;
	const newActions = oldState.tgos
		.filter(tgo => tgo.components)
		.map(tgo => 
			tgo.components
				.map(cId => components[cId])
				.filter(c => c.tick)
				.map(c => c.tick(tgo))
			)
		.reduce((acc, action) => [...acc, ...action], []) // Flatten one level
		.reduce((acc, action) => [...acc, ...action], []);
	newActions.forEach(a => store.dispatch(a));
};

export const initOldHtml = () => {
	// View specific
	document.body.appendChild(viewActions.create('main', 'jesh', true));
	document.body.appendChild(viewActions.create('secondary', 'genStore'));
};

export default init;
