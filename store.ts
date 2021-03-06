import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { batchedSubscribe, NotifyFunction } from 'redux-batched-subscribe';
import { persistStore, persistReducer } from 'redux-persist';

import isServer from './isServer'
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web and AsyncStorage for react-native
// AsyncNodeStorage is not included in browser.
// import { AsyncNodeStorage } from 'redux-persist-node-storage';

import topGeorgist from './reducers';
import rootSaga from './sagas/root';

const sagaMiddleware = createSagaMiddleware();
const middleWares = applyMiddleware(sagaMiddleware);

let enhancer;
let letStore;
let letPersistor;

if (isServer) {
	// Server
	enhancer = compose(middleWares);
	const persistReducers = persistReducer(
		{
			key: 'root',
			storage,
			version: 1,
			blacklist: ['clients'],
		},
		topGeorgist,
	);
	letStore = createStore(
		persistReducers,
		{},
		enhancer,
	);
	letPersistor = persistStore(letStore);
} else {
	// Client
	const enhancer = compose(
		middleWares,
		// batchedSubscribe((notify: NotifyFunction) => {
		// 	if (window.requestAnimationFrame) {
		// 		window.requestAnimationFrame(notify);
		// 	} else {
		// 		notify();
		// 	}
		// }),
	);
	letStore = createStore(
		topGeorgist,
		{},
		enhancer
	);
}

sagaMiddleware.run(rootSaga);

const store = letStore;
const persistor = letPersistor;

export {
	store,
	persistor,
};
