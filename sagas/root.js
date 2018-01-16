import transaction from './transaction';
import plant from './plantable';

const rootSaga = function* () {
	yield* transaction();
	yield* plant();
};

export default rootSaga;
