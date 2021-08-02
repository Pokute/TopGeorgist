import util from 'util';
import { default as test } from 'ava';
import { expectSaga } from 'redux-saga-test-plan';
import { createAction, ActionType, getType } from 'typesafe-actions';
import { takeEvery, take, fork, put } from 'redux-saga/effects';

import { expectSaga as ownExpectSaga, tryWrapTakeEvery, wrapEveryErrorReportAction } from '../sagas/sagaHelper';

// This file is for testing redux-saga-test-plan behaviour
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

// const setupRedux = () => {
// 	const wrappedRootSaga = function* () {
// 		yield* rootSaga();
// 		yield takeEvery('*', function* () {});
// 	};

// 	return expectSaga(wrappedRootSaga)
// 		.withReducer(rootReducer);
// };

const testingSaga = function* () {
	yield takeEvery('*', function* () {}); // redux-saga-test-plan requires this. It won't dispatch actions if there are no sagas that take those actions.
}

test('ExpectSaga initializes store correctly', async t => {
	const res = expectSaga(testingSaga)
		.withReducer(testStore)
		.silentRun(0);

	t.deepEqual((await res).storeState, { current: 0 });
});

test.failing('Known failure: ExpectSaga doesn\'t process actions without take actions.', async t => {
	const res = expectSaga(function* () {})
			.withReducer(testStore)
			.dispatch(increase())
			.silentRun(0);

	t.deepEqual((await res).storeState, { current: 1 });
});

test('ExpectSaga handles actions', async t => {
	const res = expectSaga(testingSaga)
		.withReducer(testStore)
		.dispatch(increase())
		.dispatch(increase({ amount : 4}))
		.dispatch(increase())
		.silentRun(0);

	t.deepEqual((await res).storeState, { current: 6 });
});

test('ExpectSaga handles actions in correct order', async t => {
	const res = expectSaga(testingSaga)
		.withReducer(testStore)
		.dispatch(set(10))
		.dispatch(increase({ amount: -2 }))
		.dispatch(double())
		.silentRun(0);

	t.deepEqual((await res).storeState, { current: 16 });
});

test('ExpectSaga handles a saga that throws', async t => {
	const onIncrease = function * () {
		yield take(increase);
		yield take(increase);
		throw new Error('After second increase')
	};

	const res1 = await (expectSaga(onIncrease)
		.withReducer(testStore)
		.dispatch(increase())
		.silentRun(0));

	t.deepEqual(res1.storeState, { current: 1 });

	const res2 = await (expectSaga(onIncrease)
		.withReducer(testStore)
		.throws(new Error('After second increase'))
		.dispatch(increase())
		.dispatch(increase())
		.silentRun(0));

	t.deepEqual(res2.storeState, { current: 2 });
});

test('ExpectSaga handles a forked saga that throws', async t => {
	const onIncrease = function * () {
		try {
			yield take(increase);
			yield fork(function * () {
				throw new Error('After second increase')
			})
			yield take(increase);
		} catch (e) {
			console.log('Catched.')
		}
	};

	const res1 = await (expectSaga(onIncrease)
		.withReducer(testStore)
		.dispatch(increase())
		.silentRun(0));

	t.deepEqual(res1.storeState, { current: 1 });

	// const res2 = await (expectSaga(onIncrease)
	// 	.withReducer(testStore)
	// 	.throws(new Error('After second increase'))
	// 	.dispatch(increase())
	// 	.dispatch(increase())
	// 	.silentRun(0));

	// t.deepEqual(res2.storeState, { current: 2 });
});

test('Our own expectSaga doesn\'t allow using .throws()', t => {
	t.throwsAsync(async () => {
		await ownExpectSaga(function* () {})
			.throws('foo');
	});
});

test('tryWrapTakeEvery catches exceptions and wraps them in an action.', async t => {
	t.plan(0);
	const a = createAction('A')();

	await ownExpectSaga(function* () {
		yield tryWrapTakeEvery(getType(a), function* (ac: ActionType<typeof a>) {
			throw new Error('Our fun error');
		});
	})
		.dispatch(a())
		.put(wrapEveryErrorReportAction({
			actionPattern: getType(a),
			workerName: '',
			error: new Error('Our fun error'),
		}))
		.silentRun(0);
});
