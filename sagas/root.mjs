import buildingGovernment from './buildings/government';
import buildingRentOffice from './buildings/rentOffice';
import net from './net';
import plant from './plantable';
import player from './player';
import ticker from './ticker';
import transaction from './transaction';
import view from './view';

const rootSaga = function* () {
	yield* buildingGovernment();
	yield* buildingRentOffice();
	yield* net();
	yield* plant();
	yield* player();
	yield* ticker();
	yield* transaction();
	yield* view();
};

export default rootSaga;
