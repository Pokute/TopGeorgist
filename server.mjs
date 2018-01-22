import store from './store';
import createItemTypes from './types';
import createInitialObjects from './initialObjects'
import { Server as WSS } from 'ws';

// Start the server
var wss = new WSS({ port: 4320 });

console.log('Started server');

// When a connection is established
wss.on('connection', function(socket) {
	console.log('Opened connection 🎉');

	// Send data back to the client
	var json = JSON.stringify({ message: 'Gotcha' });
	socket.send(json);

	// When data is received
	socket.on('message', function(message) {
		console.log('Received: ' + message);
	});

	// The connection was closed
	socket.on('close', function() {
		console.log('Closed Connection 😱');
	});
  
});

const init = () => {
	createItemTypes();
	createInitialObjects();

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
