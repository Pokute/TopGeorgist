import account from './account.js';
import buildingGovernment from './buildings/government.js';
import buildingRentOffice from './buildings/rentOffice.js';
import client from './client.js';
import goal from './goal.js';
import goalCreator from './goalCreator.js';
import serverConnection from './ServerConnection.js';
import consumable from './consumable.js';
import frame from './frame.js';
import net from './net.js';
import plant from './plantable.js';
import player from './player.js';
import taskQueue from './taskQueue.js';
import ticker from './ticker.js';
import { transactionRootSaga } from '../concerns/transaction.js';
import view from './view.js';
import { workRootSaga } from '../concerns/work.js';

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
	yield* transactionRootSaga();
	yield* view();
	yield* workRootSaga();
};

export default rootSaga;
