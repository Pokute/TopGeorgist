import { createStore, compose } from 'redux';
//import { batchedSubscribe, NotifyFunction } from 'redux-batched-subscribe';

import topGeorgist from './reducers/index.js';
import { middleWares, startSaga } from './storeCommon.js';

// Client
const store = createStore(
	topGeorgist,
	undefined,
	compose(
		middleWares,
		// batchedSubscribe((notify: NotifyFunction) => {
		// 	if (window.requestAnimationFrame) {
		// 		window.requestAnimationFrame(notify);
		// 	} else {
		// 		notify();
		// 	}
		// }),
	)
);
const persistor = undefined;

startSaga();

export {
	store,
	persistor,
};
