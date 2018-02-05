import transaction from './transaction';
import plant from './plantable';
import view from './view';
import player from './player';

const rootSaga = function* () {
	yield* transaction();
	yield* plant();
	yield* view();
	yield* player();
};

export default rootSaga;
