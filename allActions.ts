import { ActionType } from 'typesafe-actions'

import { tickerActions } from './concerns/ticker'
import { serverConnectionActions } from './actions/serverConnection';
import { transactionActions } from './concerns/transaction';
import * as defaultsActions from './actions/defaults';
import { workActions } from './concerns/work';
import { moveGoal } from './actions/moveGoal';
import { payRent, rentOfficeActions } from './concerns/rentOffice';

const allActions = {
	defaults: defaultsActions,
	ticker: tickerActions,
	serverConnection: serverConnectionActions,
	transaction: transactionActions,
	work: workActions,
	moveGoal,
	rentOffice: rentOfficeActions,
	payRent, 
};

export type AllActions = ActionType<typeof allActions>;

export default allActions;
