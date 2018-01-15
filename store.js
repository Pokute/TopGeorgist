import { createStore, applyMiddleware } from 'redux'
import createSagaMiddleware from 'redux-saga';

import topGeorgist from './reducers/index.js'
import rootSaga from './sagas/root';

const sagaMiddleware = createSagaMiddleware();

const store = createStore(
	topGeorgist,
	applyMiddleware(sagaMiddleware)
);
sagaMiddleware.run(rootSaga);

export default store;
