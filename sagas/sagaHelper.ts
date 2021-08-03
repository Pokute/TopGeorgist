import { put, takeEvery, ActionPattern, fork, take, call } from "redux-saga/effects"
import { createAction, Action } from "typesafe-actions";

export const wrapEveryErrorReportAction = createAction('SAGA_ERROR_REPORT',
({
	actionPattern,
	workerName,
	error
}: {
	actionPattern: ActionPattern,
	workerName: string,
	error: Error
}) => ({
	actionPattern,
	workerName,
	error
})
)();

export const tryWrapTakeEvery = <A extends Action> (pattern: ActionPattern<A>, worker: (action: A) => any) => 
	fork(function * () {
		while (true) {
			try {
				const action = yield take(pattern)
				yield call(worker, action);
			} catch (error) {
				yield put(wrapEveryErrorReportAction({
					actionPattern: pattern,
					workerName: worker.name,
					error
				}));
			}
		}
	});
