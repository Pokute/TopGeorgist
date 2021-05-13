import { default as test } from 'ava';
import { createAction } from 'typesafe-actions';

import { omitType } from '../testUtils.js';

test('omitType works properly', t => {
	const action = createAction('OMITTYPE_TEST')();

	t.deepEqual(omitType(action()), { payload: {
	} });
});
