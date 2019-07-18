import { default as test } from 'ava';
import { Action } from 'redux'
import { createAction } from 'typesafe-actions';

// We don't care about the type strings of actions.
// createAction also adds meta and error fields. Can't care about them either.
export const omitType = <T extends Action & { meta?: any, error?: any }>(action: T) => {
	const { type, meta, error, ...withoutType }: { type: Action['type'], meta?: any, error?: any } = action;
	return withoutType as Omit<T, 'type'>;
};

test('omitType works properly', t => {
	const action = createAction('OMITTYPE_TEST', (resolve) => () => resolve({}));

	t.deepEqual(omitType(action()), { payload: {
	} });
});
