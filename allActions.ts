import { type ActionType } from 'typesafe-actions'

import { tickerActions } from './concerns/ticker.ts'
import { serverConnectionActions } from './concerns/clientToServerConnection.ts';
import { transactionActions } from './concerns/transaction.ts';
import * as defaultsActions from './actions/defaults.ts';
import { workActions } from './concerns/work.ts';
import { moveGoal } from '#tg/concerns/movement.ts';
import { payRent, rentOfficeActions } from './concerns/rentOffice.ts';
import { deployableActions } from './concerns/deployable.ts'
import { goalActionList } from './concerns/goal.ts';
import { itemReqGoal } from './concerns/itemReqGoal.ts';
import { itemKeepMinGoal } from './concerns/itemKeepMinGoal.ts';
import { consumerActions } from './concerns/consumer.ts';
import { prefabsActions } from '#tg/concerns/prefab.ts';

const allActions = {
	defaults: defaultsActions,
	ticker: tickerActions,
	serverConnection: serverConnectionActions,
	transaction: transactionActions,
	work: workActions,
	goal: goalActionList,
	moveGoal,
	itemReqGoal,
	itemKeepMinGoal,
	rentOffice: rentOfficeActions,
	payRent,
	deployableActions,
	consumerActions,
	prefabsActions,
};

export type AllActions = ActionType<typeof allActions>;

export default allActions;
