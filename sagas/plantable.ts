import { put, takeEvery } from 'typed-redux-saga';
import * as plantableActions from '../actions/plantable.js';
import * as taskQueueActions from '../actions/taskQueue.js';
import { transaction } from '../concerns/transaction.js';
import { ActionType, getType } from 'typesafe-actions';
import { hasComponentInventory } from '../concerns/inventory.js';
import { hasComponentPosition } from '../components/position.js';
import { select } from '../redux-saga-helpers.js';
import { mapPosition } from '../concerns/map.js';

const harvest = function* ({ payload: { tgoId: actorTgoId, visitableTgoId: targetTgoId, plantTypeId }}: ActionType<typeof plantableActions.harvest>) {
	const s = yield* select();
	const actorTgo = s.tgos[actorTgoId];
	const visitableTgo = s.tgos[targetTgoId];
	if (!hasComponentPosition(actorTgo) || (!hasComponentPosition(visitableTgo)))
		return false;

	if (!actorTgo || !hasComponentInventory(visitableTgo) || !plantTypeId) return false;
	if (!mapPosition.matching(actorTgo.position, visitableTgo.position)) return false;

	const visitableItems = visitableTgo.inventory.find(i => i.typeId === plantTypeId);
	if (!visitableItems) return false;

	const transactionResult = transaction({
		tgoId: actorTgoId,
		items: [
			{
				typeId: plantTypeId,
				count: visitableItems.count || 0,
			},
		],
	});
	console.log('transactionResult: ', transactionResult);
	const plantType = (yield* select()).itemTypes[plantTypeId];

	const remove = {
		type: 'TGO_REMOVE',
		payload: {
			tgoId: targetTgoId,
		},
	};
	yield* put(taskQueueActions.addTaskQueue(
		actorTgoId,
		[
			{
				title: `Harvesting ${plantType.label}`,
				progress: {
					time: 0,
				},
				cost: {
					time: 15,
				},
				completionAction: transactionResult,
			},
			{
				title: `Removing`,
				progress: {
					time: 0,
				},
				cost: {
					time: 0,
				},
				completionAction: remove,
			},
		],
	));

	return true;
};

const plantListener = function* () {
	yield* takeEvery(getType(plantableActions.harvest), harvest);
};

export default plantListener;
