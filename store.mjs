import { createStore, applyMiddleware, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { batchedSubscribe } from 'redux-batched-subscribe';
import { persistStore, persistReducer } from 'redux-persist';

// AsyncNodeStorage is not included in browser.
import { AsyncNodeStorage } from 'redux-persist-node-storage';

import topGeorgist from './reducers/index'
import rootSaga from './sagas/root';

const sagaMiddleware = createSagaMiddleware();
const middleWares = applyMiddleware(sagaMiddleware)

let enhancer;
let store;
let persistor;

if (global.isServer) {
	// Server
	enhancer = compose(middleWares);
	const persistReducers = persistReducer({
			key: 'root',
			storage: new AsyncNodeStorage('storage/'),
			version: 1,
		},
		topGeorgist
	);
	store = createStore(
		persistReducers,
		undefined,
		enhancer
	);
	persistor = persistStore(store);
} else {
	// Client
	enhancer = compose(
		middleWares,
		batchedSubscribe(notify => {
			if (window.requestAnimationFrame)
				window.requestAnimationFrame(notify)
			else
				notify();
		})
	);
	store = createStore(
		topGeorgist,
		undefined,
		enhancer
	);
}

sagaMiddleware.run(rootSaga);

export {
	store,
	persistor,
};
