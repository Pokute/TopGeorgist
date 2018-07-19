import { put, select, takeEvery } from 'redux-saga/effects';
import * as governmentActions from '../../actions/government';
import * as inventoryActions from '../../actions/inventory';
import { transaction } from '../../actions/transaction';
import { checkOnVisitableLocation } from '../../utils/visitable';
import { RootStateType } from '../../reducers';

const claimCitizenship = function* ({ tgoId, visitableTgoId }: any) {
	const s: RootStateType = yield select();
	const actorTgo = s.tgos[tgoId];
	const visitableTgo = s.tgos[visitableTgoId];

	if (!checkOnVisitableLocation(actorTgo, visitableTgo)) {
		return false;
	}

	const citizen = s.government.citizens[tgoId];
	if (citizen) return false; // Already a citizen
	yield put(governmentActions.addCitizen(tgoId));
	return true;
};

const claimStipend = function* ({ tgoId, visitableTgoId }: any) {
	const s: RootStateType = yield select();
	const actorTgo = s.tgos[tgoId];
	const visitableTgo = s.tgos[visitableTgoId];

	if (!checkOnVisitableLocation(actorTgo, visitableTgo)) {
		return false;
	}

	const citizen = s.government.citizens[tgoId];
	if (!citizen) return false;
	const accruedStipend = citizen.stipend;
	yield put(governmentActions.addStipend(tgoId, -accruedStipend));
	yield put(inventoryActions.add(tgoId, 'money', accruedStipend));
	return true;
};

const governmentListener = function* () {
	yield takeEvery('GOVERNMENT_CLAIM_CITIZENSHIP', claimCitizenship);
	yield takeEvery('GOVERNMENT_CLAIM_STIPEND', claimStipend);
};

export default governmentListener;
