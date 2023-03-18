import { put, takeEvery }  from 'typed-redux-saga';
import { ActionType, getType, createAction } from 'typesafe-actions';

import * as governmentActions from '../../actions/government.js';
import { inventoryActions } from '../../concerns/inventory.js';
import { transaction } from '../../concerns/transaction.js';
import { hasComponentPosition } from '../../components/position.js';
import { hasComponentInventory } from '../../concerns/inventory.js';
import { TypeId } from '../../reducers/itemType.js';
import { TgoId } from '../../reducers/tgo.js';
import { MapPosition, mapPosition } from '../../concerns/map.js';
import { select } from '../../redux-saga-helpers.js';

export const claimLand = createAction('RENT_OFFICE_CLAIM_LAND', ({
	tgoId,
	position,
	visitableTgoId,
}: {
	tgoId: TgoId,
	position: MapPosition,
	visitableTgoId: TgoId,
}) => ({
	tgoId,
	position,
	visitableTgoId,
}))();

const claimLandsaga = function* ({ payload: { position, tgoId, visitableTgoId }}: ReturnType<typeof claimLand>) {
	const s = yield* select();
	const actorTgo = s.tgos[tgoId];
	const visitableTgo = s.tgos[visitableTgoId];
	if (!hasComponentPosition(actorTgo) || !hasComponentPosition(visitableTgo))
		return false;

	if (!mapPosition.matching(actorTgo.position, visitableTgo.position)) return false;

	const existingClaim = s.government.claims
		.find(c => (
			mapPosition.matching(c.position, position)
		));
	if (existingClaim) return false;

	yield* put(governmentActions.rent(tgoId, position));
	return true;
};

export const payRent = createAction('RENT_OFFICE_PAY_RENT', ({
	tgoId,
	visitableTgoId,
}: {
	tgoId: TgoId,
	visitableTgoId: TgoId,
}) => ({
	tgoId,
	visitableTgoId,
}))();

const payRentSaga = function* ({
	payload: { tgoId, visitableTgoId }
}: ReturnType<typeof payRent>) {
	const s = yield* select();
	const actorTgo = s.tgos[tgoId];
	const visitableTgo = s.tgos[visitableTgoId];
	if (!hasComponentPosition(actorTgo) || !hasComponentPosition(visitableTgo))
		return false;

	if (!mapPosition.matching(actorTgo.position, visitableTgo.position)) return false;

	const citizen = s.government.citizens[tgoId];
	if (!citizen) return false;

	const citizenClaims = s.government.claims.filter(c => c.tgoId === tgoId);
	for (const claim of citizenClaims) {
		const currentRentDebt = claim.rentDebt;
		const moneyItem = hasComponentInventory(actorTgo) ? actorTgo.inventory.find(it => it.typeId === 'money') : { count: 0 };
		const currentMoney = moneyItem ? moneyItem.count : 0;
		const change = Math.max(Math.min(currentRentDebt, currentMoney), 0);
		yield* put(governmentActions.addRentDebt(tgoId, claim.position, -change));
		yield* put(inventoryActions.add(tgoId, 'money' as TypeId, -change));
		yield* put(governmentActions.distribute(change));
	}
	return true;
};

const rentOfficeListener = function* () {
	yield* takeEvery(getType(claimLand), claimLandsaga);
	yield* takeEvery(getType(payRent), payRentSaga);
};

export default rentOfficeListener;
