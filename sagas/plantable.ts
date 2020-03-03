import { put, select, takeEvery } from 'redux-saga/effects';
import { inventoryActions } from '../components/inventory';
import * as plantableActions from '../actions/plantable';
import * as tgosActions from '../actions/tgos';
import * as taskQueueActions from '../actions/taskQueue';
import { transaction } from '../concerns/transaction';
import { checkOnVisitableLocation } from '../utils/visitable';
import { ActionType, getType } from 'typesafe-actions';
import { RootStateType } from '../reducers';
import { hasComponentMapGridOccipier } from '../data/components_new';
import { hasComponentInventory } from '../components/inventory';
import { hasComponentPosition } from '../components/position';

const plant = function* ({ payload: { actorTgoId, targetTypeId }}: ActionType<typeof plantableActions.plant>) {
	const s: RootStateType = yield select();
	const actorTgo = s.tgos[actorTgoId];
	const plantableType = s.itemTypes[targetTypeId];

	if (!hasComponentPosition(actorTgo))
		return false;
	const plantPosition = actorTgo.position;

	const freePlot = Object.values(s.tgos)
		.filter(tgo => (
			hasComponentPosition(tgo) && tgo.position && (tgo.position.x === plantPosition.x) && (tgo.position.y === plantPosition.y)
		))
		.every(tgo => !hasComponentMapGridOccipier(tgo))
	if (!freePlot) return false;

	const transactionResult = yield put(transaction({
		tgoId: actorTgoId,
		items: [
			{
				typeId: targetTypeId,
				count: -1,
			},
		],
	}));

	console.log('transactionResult: ', transactionResult);

	if (!plantableType.growsIntoTypeId) return false;

	const planting = tgosActions.add({
		mapGridOccupier: true,
		position: plantPosition,
		presentation: { color: 'orange' },
		visitable: {
			label: `Growing here: ${plantableType.label}`,
			actions: [
				{
					label: 'Harvest',
					onClick: {
						type: 'HARVEST',
						plantTypeId: plantableType.growsIntoTypeId,
					},
				},
			],
		},
		inventory: [
			{
				typeId: plantableType.growsIntoTypeId,
				count: 0.25,
			},
		],
		components: [
			['inventoryChange', { typeId: plantableType.growsIntoTypeId, perTick: (1 / 256) }],
		],
	});

	yield put(taskQueueActions.addTaskQueue(
		actorTgoId,
		[{
			title: `Planting ${plantableType.label}`,
			progress: {
				time: 0,
			},
			cost: {
				time: 50,
			},
			completionAction: planting,
		}],
	));
	return true;
};

const harvest = function* ({ payload: { tgoId: actorTgoId, visitableTgoId: targetTgoId, plantTypeId }}: ActionType<typeof plantableActions.harvest>) {
	const s: RootStateType = yield select();
	const actorTgo = s.tgos[actorTgoId];
	const visitableTgo = s.tgos[targetTgoId];
	if (!hasComponentPosition(actorTgo) || (!hasComponentPosition(visitableTgo)))
		return false;

	if (!actorTgo || !hasComponentInventory(visitableTgo) || !plantTypeId) return false;
	if (!checkOnVisitableLocation(actorTgo, visitableTgo)) return false;

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
	const plantType = (yield select()).itemTypes[plantTypeId];

	const remove = {
		type: 'TGO_REMOVE',
		payload: {
			tgoId: targetTgoId,
		},
	};
	yield put(taskQueueActions.addTaskQueue(
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
	yield takeEvery(getType(plantableActions.plant), plant);
	yield takeEvery(getType(plantableActions.harvest), harvest);
};

export default plantListener;
