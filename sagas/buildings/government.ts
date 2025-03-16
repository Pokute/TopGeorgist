import { put, takeEvery }  from 'typed-redux-saga';
import * as governmentActions from '../../actions/government.ts';
import { inventoryActions } from '../../concerns/inventory.ts';
import { transaction } from '../../concerns/transaction.ts';
import { hasComponentPosition } from '../../components/position.ts';
import { type TypeId } from '../../reducers/itemType.ts';
import { select } from '../../redux-saga-helpers.ts';
import { mapPosition } from '../../concerns/map.ts';

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
