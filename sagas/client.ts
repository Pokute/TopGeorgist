import { put, takeEvery }  from 'typed-redux-saga';
import { ActionType, getType } from 'typesafe-actions';

import isServer from '../isServer.js'
import * as tgoActions from '../actions/tgo.js';
import * as netActions from '../concerns/infra/net.js';
// import { setGoals } from '../concerns/goal.js';
import { moveGoal } from '../actions/moveGoal.js';
import { itemReqGoal } from '../concerns/itemReqGoal.js';
import { itemKeepMinGoal } from '../concerns/itemKeepMinGoal.js';

const sentTypes = {
	// setGoals,
	moveGoal,
	itemReqGoal,
	itemKeepMinGoal,
} as const;

const sendAction = function* (action: ActionType<typeof sentTypes>) {
	yield* put(netActions.send(action));
};

const clientListener = function* () {
	if (isServer) return;

	// This will send all following actions to the server
	yield* takeEvery(
		Object.values(sentTypes).map(getType),
		sendAction,
	);
};

export default clientListener;
