import util from 'util';
import { default as test } from 'ava';
import { createAction, type ActionType, getType } from 'typesafe-actions';
import { takeEvery, take } from 'redux-saga/effects';

import { SagaTester } from '../testUtils.ts';
import { tryWrapTakeEvery, wrapEveryErrorReportAction } from '../sagas/sagaHelper.ts';

// This file is for testing redux-saga-tester behaviour
//  and also figuring out how redux-saga works.
// https://redux-saga.js.org/docs/advanced/ForkModel#error-propagation
// Above link explains throwing in redux-saga.
// The result is that I might want to guard all takeEvery's in my code
//  in a way that both:
//   - Gracefully fails
//   - Logs what kind of throws were done and why.
//   - Resumes listening
//   - Doesn't shut down whole root saga.
// For this some utility functions would be great.
// 
// Additionally we need to find ways to have transaction support for our
//  sagas/store. This would allow rolling back larger instances if they fail
//  at some point in the middle. Alternatively we could do a lot more testing
//  up front for each listened action that no parameter is illegal before we make
//  any changes to the store / start new sagas. Cancelling started sagas is possible too.

util.inspect.defaultOptions.depth = 500;  

const increase = createAction('INCREASE',
	({ amount = 1 }: { amount: number } = { amount: 1 }) => ({
		amount,
	})
)();

const set = createAction('SET',
	( value: number ) => ({
		value,
	})
)();

const double = createAction('DOUBLE')();

export interface StoreType {
	readonly current: number,
};

export const initialState: StoreType = {
	current: 0,
};

type Action =
	ActionType<typeof increase>
	| ActionType<typeof set>
	| ActionType<typeof double>;

const testStore = (state = initialState, action: Action) => {
	switch (action.type) {
		case getType(increase):
			return {
				...state,
				current: state.current + action.payload.amount,
			};
		case getType(set):
			return {
				...state,
				current: action.payload.value,
			};
		case getType(double):
			return {
				...state,
				current: state.current * 2,
			};
		default:
			return state;
	}
};

test('SagaTester is a valid constructor', t => {
	// redux-saga-tester is export symbols in wrong way for new node so check that our version does it correctly.

	t.true(typeof SagaTester === 'function');
	t.notThrows(() => { new SagaTester(); });
})

test('SagaTester initializes store correctly', t => {
	const storeTester = new SagaTester({
		reducers: testStore,
	});

	t.deepEqual(storeTester.getState(), { current: 0 });
});

test('SagaTester processes actions without take actions.', t => {
	const storeTester = new SagaTester({
		reducers: testStore,
	});
	storeTester.dispatch(increase())

	t.deepEqual(storeTester.getState(), { current: 1 });
});

test('SagaTester handles actions', async t => {
	const storeTester = new (SagaTester as any)({
		reducers: testStore,
	});
	storeTester.dispatch(increase())
	storeTester.dispatch(increase({ amount : 4}))
	storeTester.dispatch(increase())

	t.deepEqual(storeTester.getState(), { current: 6 });
});

test('SagaTester handles actions in correct order', t => {
	const storeTester = new SagaTester({
		reducers: testStore,
	});
	storeTester.dispatch(set(10))
	storeTester.dispatch(increase({ amount : -2}))
	storeTester.dispatch(double())

	t.deepEqual(storeTester.getState(), { current: 16 });
});

test.skip('SagaTester handles a saga that throws', t => {
	const onIncrease = function * () {
		yield take(increase);
		yield take(increase);
		throw new Error('After second increase')
	};

	const storeTester = new SagaTester({
		reducers: testStore,
	});
	storeTester.start(onIncrease);
	storeTester.dispatch(increase())

	t.deepEqual(storeTester.getState(), { current: 1 });


	const storeTester2 = new SagaTester({
		reducers: testStore,
	});
	storeTester2.start(onIncrease);
	storeTester.dispatch(increase())
	t.throws(() => storeTester2.dispatch(increase()));

	// const res2 = await (expectSaga(onIncrease)
	// 	.withReducer(testStore)
	// 	.throws(new Error('After second increase'))
	// 	.dispatch(increase())
	// 	.dispatch(increase())
	// 	.silentRun(0));

	t.deepEqual(storeTester2.getState(), { current: 2 });
});

// test('SagaTester handles a forked saga that throws', t => {
// 	const onIncrease = function * () {
// 		try {
// 			yield take(increase);
// 			yield fork(function * () {
// 				throw new Error('After second increase')
// 			})
// 			yield take(increase);
// 		} catch (e) {
// 			console.log('Catched.')
// 		}
// 	};

// 	const res1 = await (expectSaga(onIncrease)
// 		.withReducer(testStore)
// 		.dispatch(increase())
// 		.silentRun(0));

// 	t.deepEqual(res1.storeState, { current: 1 });

// 	// const res2 = await (expectSaga(onIncrease)
// 	// 	.withReducer(testStore)
// 	// 	.throws(new Error('After second increase'))
// 	// 	.dispatch(increase())
// 	// 	.dispatch(increase())
// 	// 	.silentRun(0));

// 	// t.deepEqual(res2.storeState, { current: 2 });
// });

test('tryWrapTakeEvery catches exceptions and wraps them in an action.', t => {
	const a = createAction('A')();

	const storeTester = new SagaTester({
		reducers: testStore,
	});
	storeTester.start(function* () {
		yield tryWrapTakeEvery(getType(a), function* (ac: ActionType<typeof a>) {
			throw new Error('Our fun error');
		});
	});
	storeTester.dispatch(a())

	t.deepEqual(storeTester.getCalledActions(), [
		a(),
		wrapEveryErrorReportAction({
			actionPattern: getType(a),
			workerName: '',
			error: new Error('Our fun error'),
		})
	]);
});
