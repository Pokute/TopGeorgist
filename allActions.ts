import { ActionType } from 'typesafe-actions'

import { tickerActions } from './concerns/ticker'
import { serverConnectionActions } from './actions/serverConnection';
import { transactionActions } from './concerns/transaction';
import * as defaultsActions from './actions/defaults';

const allActions = {
	defaults: defaultsActions,
	ticker: tickerActions,
	serverConnection: serverConnectionActions,
	transaction: transactionActions,
}

export type AllActions = ActionType<typeof allActions>;

export default allActions;
