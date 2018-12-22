// Client code.

import WebSocketWrapper from 'ws-wrapper';

import config from './config';
import { store } from './store';
import createItemTypes from './types';
import * as viewActions from './actions/view';
import * as mapActions from './actions/map';
import * as tileSetsActions from './actions/tileSets';
import * as tgoActions from './actions/tgo';
import * as tgosActions from './actions/tgos';

const init = () => {
	global.ws = new WebSocketWrapper(new WebSocket(`ws://${config.gameServer.host}:${config.gameServer.port}`));

	global.ws.on('message', (msg: any) => {
		const data = JSON.parse(msg.data);
		if (data && data.action && data.action.type === 'ALL_SET') {
			store.dispatch(data.action);
			const newState = data.action.payload;
			if (newState.map) store.dispatch(mapActions.set(newState.map));
			if (newState.tileSets) store.dispatch(tileSetsActions.set(newState.tileSets));
			if (newState.tgos) store.dispatch(tgosActions.setAll(newState.tgos));
		} else if (data && data.action &&
			['DEFAULTS_SET_PLAYER', 'DEFAULTS_SET_ACCOUNT'].includes(data.action.type)) {
			store.dispatch(data.action);
			if (data.action.type === 'DEFAULTS_SET_PLAYER') {
				const defaultPlayerTgoId = store.getState().defaults.playerTgoId;
				if (defaultPlayerTgoId) {
					store.dispatch(viewActions.setFollowTarget('main', defaultPlayerTgoId));
					store.dispatch(viewActions.clickActionStack.push('main', tgoActions.setMoveTarget(
						defaultPlayerTgoId,
						{ x: 0, y: 0 }
					)));
				}
			}
		}
	});

	createItemTypes(store.dispatch);

	store.dispatch(viewActions.render());
	// setInterval(() => {
	// 	store.dispatch(viewActions.render());
	// }, 100);
	// setInterval(() => {
	// 	store.dispatch(viewActions.render('secondary'));
	// }, 100);
};

export default init;
