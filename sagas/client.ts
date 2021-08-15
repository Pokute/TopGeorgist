import { put, takeEvery }  from 'typed-redux-saga';
import { ActionType, getType } from 'typesafe-actions';

import isServer from '../isServer.js'
import * as tgoActions from '../actions/tgo.js';
import * as netActions from '../actions/net.js';
// import { setGoals } from '../concerns/goal.js';
import { moveGoal } from '../actions/moveGoal.js';
import { consumeGoal } from '../actions/consumeGoal.js';

const sentTypes = {
	// setGoals,
	moveGoal,
};

const sendAction = function* (action: ActionType<typeof sentTypes>) {
	yield* put(netActions.send(action));
};

const clientListener = function* () {
	if (isServer) return;

	// This will send all following actions to the server
	yield* takeEvery(
		[
			// getType(setGoals),
			getType(moveGoal),
			getType(consumeGoal),
		],
		sendAction,
	);
};

export default clientListener;
