import transaction from './transaction';

const rootSaga = function* () {
	yield* transaction();
};

export default rootSaga;
