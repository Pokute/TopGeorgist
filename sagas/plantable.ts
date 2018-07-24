import { put, select, takeEvery } from 'redux-saga/effects';
import * as inventoryActions from '../actions/inventory';
import * as plantableActions from '../actions/plantable';
import * as tgosActions from '../actions/tgos';
import * as taskQueueActions from '../actions/taskQueue';
import { transaction } from '../actions/transaction';
import { checkOnVisitableLocation } from '../utils/visitable';
import { ActionType, getType } from 'typesafe-actions';
import { RootStateType } from '../reducers';

const plant = function* ({ payload: { actorTgoId, targetTypeId }}: ActionType<typeof plantableActions.plant>) {
	const s: RootStateType = yield select();
	const actorTgo = s.tgos[actorTgoId];
	const plantableType = s.itemTypes[targetTypeId];

	const plantPosition = actorTgo.position;

	const freePlot = !Object.values(s.tgos)
		.filter(tgo => (
			tgo.position && (tgo.position.x === plantPosition.x) && (tgo.position.y === plantPosition.y)
		))
		.map(tgo => s.itemTypes[tgo.typeId])
		.some(type => type.building !== undefined && type.building);
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
		typeId: 'plant',
		position: plantPosition,
		color: 'orange',
		plantTypeId: plantableType.growsIntoTypeId,
		visitable: {
			label: `Growing here: ${plantableType.label}`,
			actions: [
				{
					label: 'Harvest',
					onClick: {
						type: 'HARVEST',
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
			action: planting,
		}],
	));
	return true;
};

const harvest = function* ({ payload: { actorTgoId, targetTgoId }}: ActionType<typeof plantableActions.harvest>) {
	const s: RootStateType = yield select();
	const actorTgo = s.tgos[actorTgoId];
	const visitableTgo = s.tgos[targetTgoId];

	if (!actorTgo || !visitableTgo.inventory || !visitableTgo.plantTypeId) return false;
	if (!checkOnVisitableLocation(actorTgo, visitableTgo)) return false;

	const visitableItems = visitableTgo.inventory.find(i => i.typeId === visitableTgo.plantTypeId);
	if (!visitableItems) return false;

	const transactionResult = transaction({
		tgoId: actorTgoId,
		items: [
			{
				typeId: visitableTgo.plantTypeId,
				count: visitableItems.count || 0,
			},
		],
	});
	console.log('transactionResult: ', transactionResult);
	const plantType = (yield select()).itemTypes[visitableTgo.plantTypeId];

	const remove = {
		type: 'TGO_REMOVE',
		tgoId: targetTgoId,
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
				action: transactionResult,
			},
			{
				title: `Removing`,
				progress: {
					time: 0,
				},
				cost: {
					time: 0,
				},
				action: remove,
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
