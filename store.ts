import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import reduxSaga from 'redux-saga';
import { batchedSubscribe, NotifyFunction } from 'redux-batched-subscribe';
import { persistStore, persistReducer } from 'redux-persist';

import isServer from './isServer.js'
import type { default as storageType } from 'redux-persist/lib/storage';
// @ts-ignore
// import { default as oStorage } from 'redux-persist/lib/storage/index.js'; // defaults to localStorage for web and AsyncStorage for react-native
import { default as oStorage } from 'redux-persist/lib/storage'; // defaults to localStorage for web and AsyncStorage for react-native

const storage = (oStorage as any).default as typeof storageType;

// AsyncNodeStorage is not included in browser.
// import { AsyncNodeStorage } from 'redux-persist-node-storage';

import topGeorgist from './reducers/index.js';
import rootSaga from './sagas/root.js';

const sagaMiddleware = reduxSaga();
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
		undefined,
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
		undefined,
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

/* Interesting stuff

type DiscriminateUnion<T, K extends keyof T, V extends T[K]> = 
  T extends Record<K, V> ? T : never

type MapDiscriminatedUnion<T extends Record<K, string>, K extends keyof T> =
  { [V in T[K]]: DiscriminateUnion<T, K, V> };

type WhatIWant = MapDiscriminatedUnion<AllActions, 'type'>;

*/