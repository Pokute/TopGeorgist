import { select, put, takeEvery, call, all } from "redux-saga/effects";

import { moveGoal } from '../actions/moveGoal';
import { getType, ActionType } from "typesafe-actions";
import { RootStateType } from "../reducers";
import { add as addTgo } from "../actions/tgos";
import { RequirementMove, RequirementConsumeTypeId } from "../reducers/goal";
import * as inventoryActions from '../components/inventory';
import { addGoals } from '../actions/goals'
import { TgoId } from "../reducers/tgo";
import isServer from '../isServer';
import { consumeGoal } from "../actions/consumeGoal";
import { setWorkTargetTgoId } from "../actions/goal";

const handleCreateMoveGoal = function* ({payload: {tgoId, position}}: ActionType<typeof moveGoal>) {
	const s: RootStateType = yield select();
	const tgo = s.tgos[tgoId];
	if (!tgo) return false;

	// Add a Goal TgoId
	const newGoalAction: ActionType<typeof addTgo> = yield put(addTgo({
		goal: {
			title: 'Move to position',
			workTgoIds: [],
			requirements: [
				{
					type: "RequirementMove",
					targetPosition: position,
				} as RequirementMove,
			],
		}
	}));

	// Add the tgoId to player inventory
	yield put(inventoryActions.addTgoId(
		tgoId,
		newGoalAction.payload.tgo.tgoId
	));

	// Add the tgoId to active goals.
	yield put(addGoals(tgoId, [newGoalAction.payload.tgo.tgoId]));
};

const handleCreateConsumeGoal = function* ({payload: {tgoId, targetTypeId, count = 1}}: ActionType<typeof consumeGoal>) {
	const s: RootStateType = yield select();
	const tgo = s.tgos[tgoId];
	if (!tgo) return false;

	// Add a Goal TgoId
	const newGoalAction: ActionType<typeof addTgo> = yield put(addTgo({
		goal: {
			title: 'Eating somehting',
			workTgoIds: [],
			requirements: [
				{
					type: "RequirementConsumeTypeId",
					consumableTypeId: targetTypeId,
					count,
				},
			],
		},
		inventory: [],
	}));

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
	yield takeEvery(getType(consumeGoal), handleCreateConsumeGoal);
};

export default goalCreatorRootSaga;
