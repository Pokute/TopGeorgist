import { put, takeEvery }  from 'typed-redux-saga';
import * as governmentActions from '../../actions/government.js';
import { inventoryActions } from '../../concerns/inventory.js';
import { transaction } from '../../concerns/transaction.js';
import { hasComponentPosition } from '../../components/position.js';
import { TypeId } from '../../reducers/itemType.js';
import { select } from '../../redux-saga-helpers.js';
import { mapPosition } from '../../concerns/map.js';

const claimCitizenship = function* ({ payload: { tgoId, visitableTgoId } }: any) {
	const s = yield* select();
	const actorTgo = s.tgos[tgoId];
	const visitableTgo = s.tgos[visitableTgoId];
	if (!hasComponentPosition(actorTgo) || !hasComponentPosition(visitableTgo))
		return false;

	if (!mapPosition.matching(actorTgo.position, visitableTgo.position)) {
		return false;
	}

	const citizen = s.government.citizens[tgoId];
	if (citizen) return false; // Already a citizen
	yield* put(governmentActions.addCitizen(tgoId));
	return true;
};

const claimStipend = function* ({ payload: { tgoId, visitableTgoId } }: any) {
	const s = yield* select();
	const actorTgo = s.tgos[tgoId];
	const visitableTgo = s.tgos[visitableTgoId];
	if (!hasComponentPosition(actorTgo) || !hasComponentPosition(visitableTgo))
		return false;

	if (!mapPosition.matching(actorTgo.position, visitableTgo.position)) {
		return false;
	}

	const citizen = s.government.citizens[tgoId];
	if (!citizen) return false;
	const accruedStipend = citizen.stipend;
	yield* put(governmentActions.addStipend(tgoId, -accruedStipend));
	yield* put(inventoryActions.add(tgoId, 'money' as TypeId, accruedStipend));
	return true;
};

const governmentListener = function* () {
	yield* takeEvery('GOVERNMENT_CLAIM_CITIZENSHIP', claimCitizenship);
	yield* takeEvery('GOVERNMENT_CLAIM_STIPEND', claimStipend);
};

export default governmentListener;
