import { put, takeEvery }  from 'typed-redux-saga';
import { type ActionType, getType } from 'typesafe-actions';

import isServer from '../isServer.ts'
import * as tgoActions from '../actions/tgo.ts';
import * as netActions from '../concerns/infra/net.ts';
// import { setGoals } from '../concerns/goal.ts';
import { moveGoal } from '../actions/moveGoal.ts';
import { itemReqGoal } from '../concerns/itemReqGoal.ts';
import { itemKeepMinGoal } from '../concerns/itemKeepMinGoal.ts';

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
