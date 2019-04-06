/// <reference path="./typings/global.d.ts" />
/// <reference path="./typings/ws-wrapper.d.ts" />
import { v4 as uuidv4 } from 'uuid';
import { Server as WSS } from 'ws';

import config from './config';
import { store } from './store';
import createItemTypes from './types';
import initialObjectActions from './initialObjects';
import * as accountCommActions from './actions/accountComm';
import * as accountsActions from './actions/accounts';
import * as tgoActions from './actions/tgo';
import * as playerActions from './actions/player';
import * as mapActions from './actions/map';
import * as clientActions from './actions/client';
import { set as allSet } from './actions/allSet';
import { getType } from 'typesafe-actions';
import { AnyAction } from 'redux';
import { extendedSocket } from './reducers/client';
import { withClient } from './actions/withClient';
import { setGoals } from './actions/goals';

// Start the server
const wss = new WSS({ port: config.gameServer.port });

console.log('Started server');

try {
// When a connection is established
	wss.on('connection', (socket) => {
		console.log('Opened connection 🎉');
		console.log('Creating a client');

		const clientId = uuidv4();

		const extended: extendedSocket = Object.create(socket, {
			'sendAction': {
				enumerable: true,
				value: function(action: AnyAction) {
					this.send(JSON.stringify({
						action
					}));
				},
				writable: true,
			}
		});

		store.dispatch(clientActions.add({
			clientId,
			socket: extended,
		}));

		// When data is received
		socket.on('message', (message) => {
			if (typeof message === 'string') {
				try {
					const data = JSON.parse(message);
					console.log(data);
					if (!data.action || !data.action.type) {
						console.log('malformed action in data: ', data);
						return;
					}
					switch (data.action.type) {
						case 'GET_ALL_OBJECTS':
							extended.sendAction(
								allSet({
									...store.getState(),
									clients: {},
								}),
							);
							break;
						case getType(accountsActions.accountRequest):
							store.dispatch(accountsActions.accountRequestWithClient({
								...data.action.payload,
								clientId,
							}));
							break;
						case getType(playerActions.playerRequest):
							store.dispatch(playerActions.playerRequestServer({
								...data.action.payload,
								clientId,
							}));
							break;
						case getType(accountCommActions.loginClientSalted):
						case getType(accountCommActions.loginWithToken):
							store.dispatch(withClient(data.action, clientId));
							break;
						case getType(accountCommActions.createAccountWithTokenClientSalted):
						case getType(tgoActions.setMoveTarget):
						case getType(setGoals):
						case 'CONSUMABLE_CONSUME':
						case 'CONSUMABLE_INTO_SEEDS':
						case 'TRANSACTION':
						case 'PLANT':
						case 'HARVEST':
						case 'STORE_TRANSACTION_REQUEST':
						case 'GOVERNMENT_CLAIM_CITIZENSHIP':
						case 'GOVERNMENT_CLAIM_STIPEND':
						case 'RENT_OFFICE_CLAIM_LAND':
						case 'RENT_OFFICE_PAY_RENT':
							store.dispatch(data.action);
							break;
						default:
							console.log(`Unhandled data action of type ${data.action.type}`);
					}
				} catch (jsonEx) {
					console.log('malformed JSON in message: ', message, '|', jsonEx);
					return;
				}
			// } else if (typeof message === 'object') {
			// 	if (message.action) {
			// 	}
			} else {
				console.log('Unknown message of type: ', typeof message);
			}
		});

		// The connection was closed
		socket.on('close', () => {
			store.dispatch(clientActions.remove(clientId));
			console.log('Closed Connection 😱');
		});

		// The connection was closed
		socket.on('error', (e) => {
			store.dispatch(clientActions.remove(clientId));
			console.log('Erred Connection 😱', e);
		});
	});
} catch (e) { console.log(e); }
const init = () => {
	createItemTypes(store.dispatch);
	initialObjectActions().forEach(o => store.dispatch(o));

	store.dispatch(mapActions.generate({ size: { x: 200, y: 30 }, seed: 1233321 }));
};

init();
