import { put, select, takeEvery } from 'redux-saga/effects';
import * as governmentActions from '../../actions/government';
import * as inventoryActions from '../../actions/inventory';
import transaction from '../../actions/transaction';
import { checkOnVisitableLocation } from '../../utils/visitable';

const claimCitizenship = function*(action) {
	const { tgoId, visitableTgoId } = action;
	const s = yield select();
	const actorTgo = s.tgos.find(tgo => tgo.tgoId === tgoId);
	const visitableTgo = s.tgos.find(tgo => tgo.tgoId === visitableTgoId);

	if (!checkOnVisitableLocation(actorTgo, visitableTgo))
		return false;

	const citizen = s.government.citizens.find(tgo => tgo.tgoId === actorTgo);
	if (citizen) return false; // Already a citizen
	yield put(governmentActions.addCitizen(tgoId));
};

const claimStipend = function*(action) {
	const { tgoId, visitableTgoId } = action;
	const s = yield select();
	const actorTgo = s.tgos.find(tgo => tgo.tgoId === tgoId);
	const visitableTgo = s.tgos.find(tgo => tgo.tgoId === visitableTgoId);

	if (!checkOnVisitableLocation(actorTgo, visitableTgo))
		return false;

	const citizen = s.government.citizens.find(tgo => tgo.tgoId === tgoId);
	if (!citizen) return false;
	const accruedStipend = citizen.stipend;
	yield put(governmentActions.addStipend(tgoId, -accruedStipend));
	yield put(inventoryActions.add(tgoId, 'money', accruedStipend));
};

const governmentListener = function*() {
	yield takeEvery('GOVERNMENT_CLAIM_CITIZENSHIP', claimCitizenship);
	yield takeEvery('GOVERNMENT_CLAIM_STIPEND', claimStipend);
};

export default governmentListener;