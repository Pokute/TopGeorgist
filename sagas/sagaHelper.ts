import { ActionPattern } from 'redux-saga/effects';
import { put, takeEvery, take, fork, call }  from 'typed-redux-saga'
import { createAction, Action } from "typesafe-actions";
import {  } from '../store';

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
				const action = yield* take(pattern)
				yield* call(worker, action);
			} catch (error) {
				if (error instanceof Error)
					yield* put(wrapEveryErrorReportAction({
						actionPattern: pattern,
						workerName: worker.name,
						error
					}));
			}
		}
	});
