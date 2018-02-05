import store from './store';
import createItemTypes from './types';
import createInitialObjects from './initialObjects'
import { Server as WSS } from 'ws';
import * as mapActions from './actions/map';
import * as plantableActions from './actions/plantable';

global.isServer = true;

// Start the server
var wss = new WSS({ port: 4320 });

console.log('Started server');

try {
// When a connection is established
wss.on('connection', function(socket) {
	console.log('Opened connection 🎉');

	// Send data back to the client
	var json = JSON.stringify({ message: 'Gotcha' });
	socket.send(json);

	// When data is received
	socket.on('message', function(message) {
		switch (message) {
			case 'GET_ALL_OBJECTS':
				socket.send(JSON.stringify(store.getState()));
				break;
			case 'PLAYER_CREATE_REQUEST':
				store.dispatch({
					...message.action,
					client: 'Blah',
				});
				break;
			default:
				console.log('Unknown message: ', message);
		};
	});

	// The connection was closed
	socket.on('close', function() {
		console.log('Closed Connection 😱');
	});

	// The connection was closed
	socket.on('error', function(e) {
		console.log('Erred Connection 😱', e);
	});
});
} catch (e) { console.log(e); }
const init = () => {
	createItemTypes();
	createInitialObjects(store);

	store.dispatch(mapActions.generate({ size: { x: 200, y: 30 }, seed: 1233321 }));

	setInterval(tick, 250);
};

const tick = () => {
	const oldState = store.getState();
	const newActions = oldState.tgos
		.filter(tgo => tgo.tick)
		.map(tgo => tgo.tick(tgo))
		.reduce((acc, actions) => acc.concat(actions));
	newActions.forEach(a => store.dispatch(a));
}

init();
