import { put, select, takeEvery } from 'redux-saga/effects';
import * as governmentActions from '../../actions/government';
import * as inventoryActions from '../../actions/inventory';
import transaction from '../../actions/transaction';
import { checkOnVisitableLocation } from '../../utils/visitable';

const claimLand = function* (action) {
	const { tgoId, visitableTgoId } = action;
	const s = yield select(state => state);
	const actorTgo = s.tgos[tgoId];
	const visitableTgo = s.tgos[visitableTgoId];

	if (!checkOnVisitableLocation(actorTgo, visitableTgo))
		return false;

	const existingClaim = s.government.claims.find(c => ((c.position.x === action.position.x) && (c.position.y === action.position.y)));
	if (existingClaim)
		return false;

	yield put(governmentActions.rent(action.tgoId, action.position));
};

const payRent = function* (action) {
	const { tgoId, visitableTgoId } = action;
	const s = yield select(state => state);
	const actorTgo = s.tgos[tgoId];
	const visitableTgo = s.tgos[visitableTgoId];

	if (!checkOnVisitableLocation(actorTgo, visitableTgo))
		return false;

	const citizen = s.government.citizens.find(tgo => tgo.tgoId === tgoId);
	if (!citizen) return false;

	const citizenClaims = s.government.claims.filter(c => c.tgoId === tgoId);
	for (let claim of citizenClaims) {
		const currentRentDebt = claim.rentDebt;
		const currentMoney = actorTgo.inventory.find(it => it.typeId === 'money').count;
		const change = Math.max(Math.min(currentRentDebt, currentMoney), 0);
		yield put(governmentActions.addRentDebt(tgoId, claim.position, -change));
		yield put(inventoryActions.add(tgoId, 'money', -change));
		yield put(governmentActions.distribute(change));
	};
};

const rentOfficeListener = function*() {
	yield takeEvery('RENT_OFFICE_CLAIM_LAND', claimLand);
	yield takeEvery('RENT_OFFICE_PAY_RENT', payRent);
};

export default rentOfficeListener;
