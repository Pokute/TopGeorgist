import transaction from './transaction';
import plant from './plantable';
import view from './view';

const rootSaga = function* () {
	yield* transaction();
	yield* plant();
	yield* view();
};

export default rootSaga;
