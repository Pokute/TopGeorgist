import { put, select, takeEvery } from 'redux-saga/effects';
import { ActionType, getType } from 'typesafe-actions';

import * as governmentActions from '../../actions/government';
import { inventoryActions } from '../../components/inventory';
import { transaction } from '../../concerns/transaction';
import { checkOnVisitableLocation } from '../../utils/visitable';
import { RootStateType } from '../../reducers';
import { hasComponentPosition } from '../../components/position';
import { hasComponentInventory } from '../../components/inventory';
import { TypeId } from '../../reducers/itemType';

const claimLand = function* ({ payload: { position, tgoId, visitableTgoId }}: any) {
	const s: RootStateType = yield select();
	const actorTgo = s.tgos[tgoId];
	const visitableTgo = s.tgos[visitableTgoId];
	if (!hasComponentPosition(actorTgo) || !hasComponentPosition(visitableTgo))
		return false;

	if (!checkOnVisitableLocation(actorTgo, visitableTgo)) return false;

	const existingClaim = s.government.claims
		.find(c => (
			(c.position.x === position.x) && (c.position.y === position.y)
		));
	if (existingClaim) return false;

	yield put(governmentActions.rent(tgoId, position));
	return true;
};

const payRent = function* ({ payload: { tgoId, visitableTgoId }}: any) {
	const s: RootStateType = yield select();
	const actorTgo = s.tgos[tgoId];
	const visitableTgo = s.tgos[visitableTgoId];
	if (!hasComponentPosition(actorTgo) || !hasComponentPosition(visitableTgo))
		return false;

	if (!checkOnVisitableLocation(actorTgo, visitableTgo)) return false;

	const citizen = s.government.citizens[tgoId];
	if (!citizen) return false;

	const citizenClaims = s.government.claims.filter(c => c.tgoId === tgoId);
	for (const claim of citizenClaims) {
		const currentRentDebt = claim.rentDebt;
		const moneyItem = hasComponentInventory(actorTgo) ? actorTgo.inventory.find(it => it.typeId === 'money') : { count: 0 };
		const currentMoney = moneyItem ? moneyItem.count : 0;
		const change = Math.max(Math.min(currentRentDebt, currentMoney), 0);
		yield put(governmentActions.addRentDebt(tgoId, claim.position, -change));
		yield put(inventoryActions.add(tgoId, 'money' as TypeId, -change));
		yield put(governmentActions.distribute(change));
	}
	return true;
};

const rentOfficeListener = function* () {
	yield takeEvery('RENT_OFFICE_CLAIM_LAND', claimLand);
	yield takeEvery('RENT_OFFICE_PAY_RENT', payRent);
};

export default rentOfficeListener;
