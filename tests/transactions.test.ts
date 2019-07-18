import { default as test } from 'ava';
import sinon from 'sinon';

import { omitType } from './utils';

// Test transactions

// See https://github.com/antoinejaussoin/redux-saga-testing/blob/master/ava/06.saga-using-selectors.test.js
//  for how to write it.

// Action creator

test('./actions/transaction.ts: transaction works', t => {
	t.pass();
});

test.todo('Test transctions')
