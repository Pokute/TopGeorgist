import serverConfig from './serverConfig';
import uuidv4 from 'uuid';
import config from './config';
import store from './store';
import createItemTypes from './types';
import initialObjectActions from './initialObjects'
import { Server as WSS } from 'ws';
import * as mapActions from './actions/map';
import * as plantableActions from './actions/plantable';
import * as clientActions from './actions/client';

// Start the server
var wss = new WSS({ port: config.gameServer.port });

console.log('Started server');

try {
// When a connection is established
wss.on('connection', function(socket) {
	console.log('Opened connection 🎉');
	console.log('Creating a client');

	const clientId = uuidv4();

	store.dispatch(clientActions.add({
		socket,
		clientId,
	}));

	// Send data back to the client
	// var json = JSON.stringify({ message: 'Gotcha' });
	// socket.send(json);

	// When data is received
	socket.on('message', function(message) {
		if (typeof message === 'string') {
			try {
				const data = JSON.parse(message);
				if (!data.action || !data.action.type) {
					console.log('malformed action in data: ', data);
					return;
				}
				switch (data.action.type) {
					case 'GET_ALL_OBJECTS':
						socket.send(JSON.stringify({
							action: {
								type: 'ALL_SET',
								data: { ...store.getState(), clients:{} }
							}
						}));
					// 	socket.send(JSON.stringify({ ...store.getState(), clients:[] }));
						break;
					case 'PLAYER_CREATE_REQUEST':
						store.dispatch({
							...data.action,
							clientId,
						});
					break;
					case 'PLAYER_SET_MOVE_TARGET':
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
				console.log('malformed JSON in message: ', message, jsonEx);
				return;
			}
		} else if (typeof message === 'object') {
			if (message.action) {
			}
		} else {
			console.log('Unknown message of type: ', typeof message);
		}
	});

	// The connection was closed
	socket.on('close', function() {
		store.dispatch(clientActions.remove(clientId));
		console.log('Closed Connection 😱');
	});

	// The connection was closed
	socket.on('error', function(e) {
		store.dispatch(clientActions.remove(clientId));
		console.log('Erred Connection 😱', e);
	});
});
} catch (e) { console.log(e); }
const init = () => {
	createItemTypes();
	initialObjectActions().forEach(o => store.dispatch(o));

	store.dispatch(mapActions.generate({ size: { x: 200, y: 30 }, seed: 1233321 }));
};

init();
