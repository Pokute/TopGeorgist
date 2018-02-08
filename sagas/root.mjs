import transaction from './transaction';
import plant from './plantable';
import view from './view';
import player from './player';
import net from './net';

const rootSaga = function* () {
	yield* transaction();
	yield* plant();
	yield* view();
	yield* player();
	yield* net();
};

export default rootSaga;
