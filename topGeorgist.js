import store from './store.js';
import createItemTypes from './types';
import createInitialObjects from './initialObjects'
import * as viewActions from './actions/view';

const init = () => {
	createItemTypes();
	createInitialObjects();

	setInterval(tick, 250);

	// View specific
	document.body.appendChild(viewActions.create(document.getElementById("canvas"), 'main', 'jesh', true));

	store.dispatch(viewActions.render());
	setInterval(() => {
		store.dispatch(viewActions.render());
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
