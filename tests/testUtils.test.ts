import { default as test } from 'ava';
import { createAction } from 'typesafe-actions';

import { omitType } from '../testUtils';

test('omitType works properly', t => {
	const action = createAction('OMITTYPE_TEST', (resolve) => () => resolve({}));

	t.deepEqual(omitType(action()), { payload: {
	} });
});
