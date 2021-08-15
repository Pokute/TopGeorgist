import { put, takeEvery, call, all }  from 'typed-redux-saga';

import { moveGoal } from '../actions/moveGoal.js';
import { getType, ActionType } from 'typesafe-actions';
import { add as addTgo } from '../actions/tgos.js';
import { /*RequirementMove, RequirementConsumeTypeId,*/ addGoals, setWorkTargetTgoId } from '../concerns/goal.js';
import * as inventoryActions from '../components/inventory.js';
import { TgoId } from '../reducers/tgo.js';
import isServer from '../isServer.js';
import { consumeGoal } from '../actions/consumeGoal.js';

const handleCreateMoveGoal = function* ({payload: {tgoId, position}}: ActionType<typeof moveGoal>) {
/*	const s = yield* select();
	const tgo = s.tgos[tgoId];
	if (!tgo) return false;

	// Add a Goal TgoId
	const newGoalAction: ActionType<typeof addTgo> = yield* put(addTgo({
		goal: {
			title: 'Move to position',
			workTgoIds: [],
			requirements: [
				{
					type: "RequirementMove",
					targetPosition: position,
				},
			],
		}
	}));

	// Add the tgoId to player inventory
	yield* put(inventoryActions.addTgoId(
		tgoId,
		newGoalAction.payload.tgo.tgoId
	));

	// Add the tgoId to active goals.
	yield* put(addGoals(tgoId, [newGoalAction.payload.tgo.tgoId]));
	*/
};

const handleCreateConsumeGoal = function* ({payload: {tgoId, targetTypeId, count = 1}}: ActionType<typeof consumeGoal>) {
	/*const s = yield* select();
	const tgo = s.tgos[tgoId];
	if (!tgo) return false;

	// Add a Goal TgoId
	const newGoalAction: ActionType<typeof addTgo> = yield* put(addTgo({
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
	yield* put(inventoryActions.addTgoId(
		tgoId,
		newGoalAction.payload.tgo.tgoId
	));

	// Add the tgoId to active goals.
	yield* put(addGoals(tgoId, [newGoalAction.payload.tgo.tgoId]));
	*/
};

const goalCreatorRootSaga = function* () {
	if (!isServer) return;
	yield* takeEvery(getType(moveGoal), handleCreateMoveGoal);
	yield* takeEvery(getType(consumeGoal), handleCreateConsumeGoal);
};

export default goalCreatorRootSaga;
