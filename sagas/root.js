import transaction from './transaction';

const rootSaga = function* () {
	console.log('starting rootSaga');
	yield* transaction();
	console.log('ending rootSaga');
};

export default rootSaga;
