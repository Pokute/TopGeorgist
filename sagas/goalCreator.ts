import { select, put, takeEvery, call, all } from "redux-saga/effects";

import { moveGoal } from '../actions/moveGoal';
import { getType, ActionType } from "typesafe-actions";
import { RootStateType } from "../reducers";
import { add as addTgo } from "../actions/tgos";
import { RequirementMove } from "../reducers/goal";
import * as inventoryActions from '../actions/inventory';
import { addGoals } from '../actions/goals'
import { TgoId } from "../reducers/tgo";
import isServer from '../isServer';

const handleCreateMoveGoal = function* ({payload: {tgoId, position}}: ActionType<typeof moveGoal>) {
	const s: RootStateType = yield select();
	const tgo = s.tgos[tgoId];
	if (!tgo) return false;

	// Add a Goal TgoId
	const newGoalAction: ActionType<typeof addTgo> = yield put(addTgo({
		goal: {
			title: 'Move to position',
			workInstances: [],
			requirements: [
				{
					type: "RequirementMove",
					targetPosition: position,
				} as RequirementMove,
			],
		}
	}))

	// Add the tgoId to player inventory
	yield put(inventoryActions.addTgoId(
		tgoId,
		newGoalAction.payload.tgo.tgoId
	));

	// Add the tgoId to active goals.
	yield put(addGoals(tgoId, [newGoalAction.payload.tgo.tgoId]));
};

const goalCreatorRootSaga = function* () {
	if (!isServer) return;
	yield takeEvery(getType(moveGoal), handleCreateMoveGoal);
};

export default goalCreatorRootSaga;
