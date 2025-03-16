import { applyMiddleware } from 'redux';
import reduxSaga from 'redux-saga';

import rootSaga from './sagas/root.ts';

const sagaMiddleware = reduxSaga();
const middleWares = applyMiddleware(sagaMiddleware);

const startSaga = () => {
	sagaMiddleware.run(rootSaga);
};

export {
	middleWares,
	startSaga,
};
