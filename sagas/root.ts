import { accountRootSaga } from '../concerns/account.js';
import buildingGovernment from './buildings/government.js';
import buildingRentOffice from './buildings/rentOffice.js';
import client from './client.js';
import goal from './goal.js';
import goalCreator from './goalCreator.js';
import serverConnection from './ServerConnection.js';
import consumable from './consumable.js';
import { frameRootSaga } from '../concerns/frame.js';
import net from './net.js';
import plant from './plantable.js';
import player from './player.js';
import taskQueue from './taskQueue.js';
import { tickerRootSaga } from '../concerns/ticker.js';
import { transactionRootSaga } from '../concerns/transaction.js';
import view from './view.js';
import { workRootSaga } from '../concerns/work.js';

const rootSaga = function* () {
	yield* accountRootSaga();
	yield* buildingGovernment();
	yield* buildingRentOffice();
	yield* client();
	yield* goal();
	yield* goalCreator();
	yield* serverConnection();
	yield* consumable();
	yield* frameRootSaga();
	yield* net();
	yield* plant();
	yield* player();
	yield* taskQueue();
	yield* tickerRootSaga();
	yield* transactionRootSaga();
	yield* view();
	yield* workRootSaga();
};

export default rootSaga;
