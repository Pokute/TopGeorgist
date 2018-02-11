import { put, select, takeEvery } from 'redux-saga/effects';
import * as inventoryActions from '../actions/inventory';
import * as tgoActions from '../actions/tgo';
import transaction from '../actions/transaction';
import { harvest as harvestAction } from '../actions/plantable';

const plant = function* (action) {
	const { actorTgoId, plantableTypeId } = action;
	const s = yield select(state => state);
	const actorTgo = s.tgos.find(tgo => tgo.tgoId === actorTgoId);
	const plantableType = s.itemTypes.find(it => it.typeId === plantableTypeId);

	const plantPosition = actorTgo.position;

	const freePlot = !s.tgos
		.filter(tgo => tgo.position && (tgo.position.x === plantPosition.x) && (tgo.position.y === plantPosition.y))
		.map(tgo => s.itemTypes.find(it => it.typeId === tgo.typeId))
		.some(type => type.building);
	if (!freePlot) return false;

	const transactionResult = yield put(transaction({
		tgoId: actorTgoId,
		items: [
			{
				typeId: plantableTypeId,
				count: -1,
			},
		],
	}));

	console.log('transactionResult: ', transactionResult);

	yield put(tgoActions.add({
		tgoId: Math.trunc(Math.random()*100000),
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
			}
		],
		components: [
			['inventoryChange', { typeId: plantableType.growsIntoTypeId, perTick: (1 / 256) }]
		],
	}));
};

const harvest = function* (action) {
	const { tgoId, visitableTgoId } = action;
	const s = yield select(state => state);
	const actorTgo = s.tgos.find(tgo => tgo.tgoId === tgoId);
	const targetTgo = s.tgos.find(tgo => tgo.tgoId === visitableTgoId);

	if (!actorTgo.position || !targetTgo.position || 
		(actorTgo.position.x !== targetTgo.position.x) || (actorTgo.position.y !== targetTgo.position.y))
		return false;

	const transactionResult = yield put(transaction({
		tgoId: tgoId,
		items: [
			{
				typeId: targetTgo.plantTypeId,
				count: targetTgo.inventory.find(i => i.typeId === targetTgo.plantTypeId).count,
			},
		],
	}));
	console.log('transactionResult: ', transactionResult);

	yield put({
		type: 'TGO_REMOVE',
		tgoId: visitableTgoId,
	});
};

const plantListener = function*() {
	yield takeEvery('PLANT', plant);
	yield takeEvery('HARVEST', harvest);
};

export default plantListener;
