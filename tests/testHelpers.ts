import OrigSagaTester from 'redux-saga-tester';
import rootReducer from '../reducers/index.js';
import rootSaga from '../sagas/root.js';

export const SagaTester = ((OrigSagaTester as any).default) as typeof OrigSagaTester;

export const setupStoreTester = () => {
	const tester = new SagaTester({
		reducers: rootReducer,
	});
	tester.start(rootSaga);
	return tester;
}
