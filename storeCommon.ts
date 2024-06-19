import { applyMiddleware } from 'redux';
import reduxSaga from 'redux-saga';

import rootSaga from './sagas/root.js';

const sagaMiddleware = reduxSaga();
const middleWares = applyMiddleware(sagaMiddleware);

const startSaga = () => {
	sagaMiddleware.run(rootSaga);
};

export {
	middleWares,
	startSaga,
};
