import account from './account';
import buildingGovernment from './buildings/government';
import buildingRentOffice from './buildings/rentOffice';
import client from './client';
import goal from './goal';
import goalCreator from './goalCreator';
import serverConnection from './ServerConnection';
import consumable from './consumable';
import frame from './frame';
import net from './net';
import plant from './plantable';
import player from './player';
import taskQueue from './taskQueue';
import ticker from './ticker';
import transaction from './transaction';
import view from './view';
import { workRootSaga } from '../concerns/work';

const rootSaga = function* () {
	yield* account();
	yield* buildingGovernment();
	yield* buildingRentOffice();
	yield* client();
	yield* goal();
	yield* goalCreator();
	yield* serverConnection();
	yield* consumable();
	yield* frame();
	yield* net();
	yield* plant();
	yield* player();
	yield* taskQueue();
	yield* ticker();
	yield* transaction();
	yield* view();
	yield* workRootSaga();
};

export default rootSaga;
