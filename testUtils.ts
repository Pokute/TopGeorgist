import { Action } from 'redux'
import OrigSagaTester from 'redux-saga-tester';

import { TgoType, TgoId } from './reducers/tgo.js';
import { add as addTgo } from './concerns/tgos.js';
import rootReducer from './reducers/index.js';
import rootSaga from './sagas/root.js';

// We don't care about the meta and error fields actions.
export const omitMetaAndError = <T extends Action & { meta?: any, error?: any }>(action: T) => {
	const { meta, error, ...withoutType }: { meta?: any, error?: any } = action;
	return withoutType as Omit<Omit<T, 'meta'>, 'error'>;
};

// We don't care about the type strings of actions.
// createAction also adds meta and error fields. Can't care about them either.
export const omitType = <T extends Action & { meta?: any, error?: any }>(action: T) => {
	const { type, meta, error, ...withoutType }: { type: Action['type'], meta?: any, error?: any } = action;
	return withoutType as Omit<T, 'type'>;
};

export const overrideTgoWithId = (targetTgo: TgoType, overrideTgoId: TgoId) => targetTgo
	? ({
		...targetTgo,
		tgoId: overrideTgoId,
	})
	: targetTgo;

export const overrideAddTgoActionWithId = (addAction: ReturnType<typeof addTgo>, overrideTgoId: TgoId): ReturnType<typeof addTgo> => addAction
	? ({
		...addAction,
		payload: {
			...addAction.payload,
			tgo: overrideTgoWithId(addAction.payload.tgo, overrideTgoId),
		}
	})
	: addAction;

	
export const SagaTester = ((OrigSagaTester as any).default) as typeof OrigSagaTester;

export const setupStoreTester = () => {
	const tester = new SagaTester({
		reducers: rootReducer,
	});
	tester.start(rootSaga);
	return tester;
}
