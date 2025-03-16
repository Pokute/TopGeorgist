/// <reference path="./typings/global.d.ts" />
/// <reference path="./typings/ws-wrapper.d.ts" />
import { v4 as uuidv4 } from 'uuid';
import { WebSocketServer as WSS } from 'ws';
import { getType } from 'typesafe-actions';

import config from './config.ts';
import { store } from './storeServer.ts';
import createItemTypes from './data/types.ts';
import initialObjectActions from './data/initialObjects.ts';
import { loginClientSalted, loginWithToken, createAccountWithTokenClientSalted, requestChangePasswordClientSalted } from './concerns/account.ts';
import { accountsActions } from './concerns/account.ts';
import * as tgoActions from './actions/tgo.ts';
import * as playerActions from './actions/player.ts';
import { mapActions, type MapSize } from './concerns/map.ts';
import * as clientActions from './actions/client.ts';
import { set as allSet } from './actions/allSet.ts';
import { type AnyAction } from 'redux';
import { type extendedSocket } from './reducers/client.ts';
import { withClient } from './actions/withClient.ts';
// import { setGoals } from './actions/goals.ts';
import { moveGoal } from './actions/moveGoal.ts';
import { type RootStateType } from './reducers/index.ts';
import { transaction } from './concerns/transaction.ts';
import { setRunning as tickerSetRunning } from './concerns/ticker.ts';
import { claimLand, payRent } from './concerns/rentOffice.ts';
import { consumerActions } from './concerns/consumer.ts';
import { deployableActions } from './concerns/deployable.ts';
import { cancelWork, createWork, pauseWork, resumeWork } from './concerns/work.ts';
import { tradeStoreTransactionRequest } from './concerns/trade.ts';
import { cancelGoal, pauseGoal, resumeGoal } from './concerns/goal.ts';
import { itemReqGoal } from './concerns/itemReqGoal.ts';
import { itemKeepMinGoal } from './concerns/itemKeepMinGoal.ts';

// Start the server
const wss = new WSS({ port: config.gameServer.port });

console.log(`Started game server. Binding to ${config.gameServer.bind}:${config.gameServer.port}`);

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
		socket.on('message', function parseMessage (this, wsData, isBinary?: boolean) {
			if (!Buffer.isBuffer(wsData)) {
				console.log('Unknown message of type: ', typeof wsData);
			}
			const message = wsData.toString();
			if (message) {
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
								} as RootStateType),
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
						case getType(loginClientSalted):
						case getType(loginWithToken):
							store.dispatch(withClient(data.action, clientId));
							break;
						case getType(createAccountWithTokenClientSalted):
						case getType(requestChangePasswordClientSalted):
						// case getType(setGoals):
						case getType(transaction):
						case getType(tradeStoreTransactionRequest):
						case 'GOVERNMENT_CLAIM_CITIZENSHIP':
						case 'GOVERNMENT_CLAIM_STIPEND':
						case getType(claimLand):
						case getType(payRent):
						case getType(createWork):
						case getType(cancelWork):
						case getType(pauseWork):
						case getType(resumeWork):
						case getType(moveGoal):
						case getType(itemReqGoal):
						case getType(itemKeepMinGoal):
						case getType(cancelGoal):
						case getType(pauseGoal):
						case getType(resumeGoal):
						case getType(consumerActions.consume):
						case getType(deployableActions.deployType):
						case getType(deployableActions.deployTgo):
						case getType(deployableActions.collect):
							store.dispatch(data.action);
							break;
						default:
							console.log(`Unhandled data action of type ${data.action.type}`);
					}
				} catch (jsonEx) {
					console.log('malformed JSON in message: ', wsData, '|', jsonEx);
					return;
				}
			// } else if (typeof message === 'object') {
			// 	if (message.action) {
			// 	}
			} else {
				console.log('Unknown message of type: ', typeof wsData);
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

	store.dispatch(mapActions.generate({ size: { x: 200, y: 30 } as MapSize, seed: 1233321 }));

	store.dispatch(tickerSetRunning(true));
};

init();
