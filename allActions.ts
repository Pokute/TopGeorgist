import { ActionType } from 'typesafe-actions'

import { tickerActions } from './concerns/ticker'
import { serverConnectionActions } from './actions/serverConnection';
import { transactionActions } from './concerns/transaction';
import * as defaultsActions from './actions/defaults';
import { workActions } from './concerns/work';

const allActions = {
	defaults: defaultsActions,
	ticker: tickerActions,
	serverConnection: serverConnectionActions,
	transaction: transactionActions,
	work: workActions,
}

export type AllActions = ActionType<typeof allActions>;

export default allActions;
