import { accountRootSaga } from '../concerns/account.ts';
import buildingGovernment from './buildings/government.ts';
import { rentOfficeRootSaga } from '../concerns/rentOffice.ts';
import client from './client.ts';
import { serverConnectionSaga } from '../concerns/clientToServerConnection.ts';
import { frameRootSaga } from '../concerns/frame.ts';
import { netRootSaga } from '../concerns/infra/net.ts';
import player from './player.ts';
import { tickerRootSaga } from '../concerns/ticker.ts';
import { tradeRootSaga } from '../concerns/trade.ts';
import view from './view.ts';

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
