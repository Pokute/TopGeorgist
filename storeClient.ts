import { createStore, compose } from 'redux';
//import { batchedSubscribe, NotifyFunction } from 'redux-batched-subscribe';

import topGeorgist from './reducers/index.ts';
import { middleWares, startSaga } from './storeCommon.ts';

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
