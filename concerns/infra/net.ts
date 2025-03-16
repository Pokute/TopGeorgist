import { createAction, type ActionType, getType } from 'typesafe-actions';
import { type AnyAction } from 'redux';
import { takeEvery, put }  from 'typed-redux-saga';

import * as netActions from '../../concerns/infra/net.ts';
import { accountsActions } from '../../concerns/account.ts';
import * as viewActions from '../../actions/view.ts';
import { mapActions } from '../../concerns/map.ts';
import * as tileSetsActions from '../../actions/tileSets.ts';
import * as tgoActions from '../../actions/tgo.ts';
import { tgosActions } from '../../concerns/tgos.ts';
import { moveGoal } from '../../actions/moveGoal.ts';
import { type MapPosition } from '../../concerns/map.ts';
import { type ViewId } from '../../reducers/view.ts';
import { select } from '../../redux-saga-helpers.ts';
import itemTypes from '../../reducers/itemTypes.ts';
import * as itemTypesActions from '../../actions/itemTypes.ts';

// Actions:

export const send = createAction('NET_SEND',
	(sendAction: AnyAction) => ({
		sendAction,
	})
)();

export const receiveMessage = createAction('NET_MESSAGE',
	(messageData: any) => ({
		messageData,
	})
)();
 
// Sagas:

const netSend = function* (action: ActionType<typeof netActions.send>) {
	const clienToServerSocket = (yield* select()).serverConnection.websocket;
	if (!clienToServerSocket) {
		return;
	}
	clienToServerSocket.send(JSON.stringify({ action: action.payload.sendAction }));
};

const receiveMessageListener = function* ({payload: { messageData }}: ActionType<typeof netActions.receiveMessage>) {
	if (!messageData || !messageData.action || !messageData.action.type) {
		console.log('Bad message received');
		return;
	}

	const payload = messageData.action.payload;

	yield* put(messageData.action);

	switch (messageData.action.type) {
		case 'ALL_SET':
			const newState = payload;
			if (newState.map) yield* put(mapActions.set(newState.map));
			if (newState.tileSets) yield* put(tileSetsActions.set(newState.tileSets));
			if (newState.tgos) yield* put(tgosActions.setAll(newState.tgos));
			if (newState.accounts) yield* put(accountsActions.setAll(newState.accounts));
			if (newState.itemTypes) yield* put(itemTypesActions.setAll(newState.itemTypes));
			break;
		case 'DEFAULTS_SET_PLAYER':
			const defaultPlayerTgoId = (yield* select()).defaults.playerTgoId;
			if (defaultPlayerTgoId) {
				yield* put(viewActions.setFollowTarget('main' as ViewId, defaultPlayerTgoId));

				yield* put(viewActions.clickActionStack.push('main' as ViewId, moveGoal(
					defaultPlayerTgoId,
					{ x: 0, y: 0 } as MapPosition,
				)))
			}
			break;
		case 'DEFAULTS_SET_ACCOUNT':
			window.localStorage.setItem('AccountToken', messageData.action.payload.token);
			break;
		default:
			console.log(`Unhandled message from server of type: ${messageData.action.type}`)
			break;
	};
};

export const netRootSaga = function* () {
	yield* takeEvery(getType(netActions.send), netSend);
	yield* takeEvery(getType(netActions.receiveMessage), receiveMessageListener);
};
