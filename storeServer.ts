import { createStore, compose } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import { AsyncNodeStorage } from 'redux-persist-node-storage';

import topGeorgist from './reducers/index.js';
import { middleWares, startSaga } from './storeCommon.js';

// Server
const persistReducers = persistReducer(
	{
		key: 'root',
		storage: new AsyncNodeStorage('/tmp/topGeorgist'),
		version: 1,
		blacklist: ['clients'],
	},
	topGeorgist,
);
const store = createStore(
	persistReducers,
	undefined,
	compose(middleWares),
);
const persistor = persistStore(store);

startSaga();

export {
	store,
	persistor,
};
