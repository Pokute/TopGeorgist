import { ActionType } from 'typesafe-actions'

import { tickerActions } from './concerns/ticker'
import { serverConnectionActions } from './concerns/clientToServerConnection';
import { transactionActions } from './concerns/transaction';
import * as defaultsActions from './actions/defaults';
import { workActions } from './concerns/work';
import { moveGoal } from './actions/moveGoal';
import { payRent, rentOfficeActions } from './concerns/rentOffice';
import { deployableActions } from './concerns/deployable.js'
import { goalActionList } from './concerns/goal';
import { itemReqGoal } from './concerns/itemReqGoal';

const allActions = {
	defaults: defaultsActions,
	ticker: tickerActions,
	serverConnection: serverConnectionActions,
	transaction: transactionActions,
	work: workActions,
	goal: goalActionList,
	moveGoal,
	itemReqGoal,
	rentOffice: rentOfficeActions,
	payRent,
	deployableActions,
};

export type AllActions = ActionType<typeof allActions>;

export default allActions;
