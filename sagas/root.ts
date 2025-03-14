import { accountRootSaga } from '../concerns/account.js';
import buildingGovernment from './buildings/government.js';
import { rentOfficeRootSaga } from '../concerns/rentOffice.js';
import client from './client.js';
import { serverConnectionSaga } from '../concerns/clientToServerConnection.js';
import { frameRootSaga } from '../concerns/frame.js';
import { netRootSaga } from '../concerns/infra/net.js';
import player from './player.js';
import { tickerRootSaga } from '../concerns/ticker.js';
import { tradeRootSaga } from '../concerns/trade.js';
import view from './view.js';

const rootSaga = function* () {
	yield* accountRootSaga();
	yield* client();
	yield* serverConnectionSaga();
	yield* frameRootSaga();
	yield* netRootSaga();
	yield* player();
	yield* tickerRootSaga();
	yield* view();
	// Refactor below into reducers eventually
	yield* buildingGovernment();
	yield* rentOfficeRootSaga();
	yield* tradeRootSaga();
};

export default rootSaga;
