import { createStore, applyMiddleware, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { batchedSubscribe } from 'redux-batched-subscribe';

import topGeorgist from './reducers/index'
import rootSaga from './sagas/root';

const sagaMiddleware = createSagaMiddleware();
const middleWares = applyMiddleware(sagaMiddleware)

let enhancer;

if (global.isServer || true) {
	// Server
	enhancer = compose(middleWares)
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
	)
}

const store = createStore(
	topGeorgist,
	undefined,
	enhancer
);
sagaMiddleware.run(rootSaga);

export default store;
