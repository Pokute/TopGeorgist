import { accountRootSaga } from '../concerns/account.js';
import buildingGovernment from './buildings/government.js';
import { rentOfficeRootSaga } from '../concerns/rentOffice.js';
import client from './client.js';
import goalCreator from './goalCreator.js';
import { serverConnectionSaga } from '../concerns/clientToServerConnection.js';
import { frameRootSaga } from '../concerns/frame.js';
import { netRootSaga } from '../concerns/infra/net.js';
import player from './player.js';
import taskQueue from './taskQueue.js';
import { tickerRootSaga } from '../concerns/ticker.js';
import { tradeRootSaga } from '../concerns/trade.js';
import view from './view.js';
import { workRootSaga } from '../concerns/work.js';
import { consumerRootSaga } from '../concerns/consumer.js';

const rootSaga = function* () {
	yield* accountRootSaga();
	yield* buildingGovernment();
	yield* rentOfficeRootSaga();
	yield* client();
	yield* goalCreator();
	yield* serverConnectionSaga();
	yield* frameRootSaga();
	yield* netRootSaga();
	yield* player();
	yield* taskQueue();
	yield* tickerRootSaga();
	yield* tradeRootSaga();
	yield* view();
	yield* workRootSaga();
	yield* consumerRootSaga();
};

export default rootSaga;
