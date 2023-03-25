import { createAction, ActionType, getType } from 'typesafe-actions';
import { put, takeEvery } from 'typed-redux-saga';

import * as governmentActions from '../actions/government.js';
import { select } from '../redux-saga-helpers.js';
import { TgoId } from '../reducers/tgo.js';
import { MapPosition, mapPosition } from './map.js';
import { hasComponentPosition } from '../components/position.js';
import { TypeId } from '../reducers/itemType.js';
import { hasComponentInventory, inventoryActions } from './inventory.js';
import { GovernmentStateType } from '../reducers/government.js';
import rootReducer, { RootStateType } from '../reducers/index.js';
import { transaction } from './transaction.js';

// Actions:

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

export const rent = createAction('GOVERNMENT_RENT_LAND',
	(tgoId: TgoId, position: MapPosition) => ({
		tgoId,
		position,
	})
)();

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

export const addRentDebt = createAction('GOVERNMENT_CLAIM_DEBT_ADD',
	(tgoId: TgoId, position: MapPosition, amount: number) => ({
		tgoId,
		position,
		amount,
	})
)();

export const addRentModulus = createAction('GOVERNMENT_ADD_RENT_MODULUS',
	(money: number) => (money)
)();

export const rentOfficeActions = {
	claimLand,
	rent,
	addRentDebt,
	addRentModulus,
} as const;

export type RentOfficeAction = ActionType<typeof rentOfficeActions>

// Sagas:

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

	yield* put(rent(tgoId, position));
	return true;
};

export const rentOfficeRootSaga = function* () {
	yield* takeEvery(getType(claimLand), claimLandsaga);
};

// Reducer:

const initialClaimState = {
	tgoId: undefined,
	position: undefined,
	rentDebt: 0,
};

export const rentOfficeReducer = (state: GovernmentStateType, action: RentOfficeAction): GovernmentStateType => {
	switch (action.type) {
		case (getType(addRentModulus)):
			return {
				...state,
				rentModulus: state.rentModulus + action.payload,
			};
		case (getType(rent)):
			return {
				...state,
				claims: [
					...state.claims,
					{
						...initialClaimState,
						tgoId: action.payload.tgoId,
						position: action.payload.position,
					},
				],
			};
		case (getType(addRentDebt)): {
			const foundClaim = state.claims.find(c => c.tgoId === action.payload.tgoId && mapPosition.matching(c.position, action.payload.position));
			if (!foundClaim)
				return state;
			return {
				...state,
				claims: [
					...state.claims.filter(c => c != foundClaim),
					{
						...foundClaim,
						rentDebt: foundClaim.rentDebt - action.payload.amount,
					},
				],
			}
		};
		default:
			return state;
	}
};

export const payRentReducer = (state: RootStateType, action: ActionType<typeof payRent>) => {
	const { tgoId: actorTgoId, visitableTgoId } = action.payload;
	const actorTgo = state.tgos[actorTgoId];
	const visitableTgo = state.tgos[visitableTgoId];
	if (!hasComponentPosition(actorTgo) || !hasComponentPosition(visitableTgo))
		return state;

	if (!mapPosition.matching(actorTgo.position, visitableTgo.position))
		return state;

	const citizen = state.government.citizens[actorTgoId];
		if (!citizen) return state;
	
	const citizenClaims = state.government.claims.filter(c => c.tgoId === actorTgoId);
	const citizenMoney = actorTgo.inventory?.find(it => it.typeId === 'money')?.count ?? 0;
	const [addRentDebtActions, payingRent] = citizenClaims.reduce<[ReadonlyArray<ReturnType<typeof addRentDebt>>, number]>(([claimRentPayActions, payingRent], claim) => 
		(citizenMoney >= Math.floor(claim.rentDebt))
			? [
				[
					...claimRentPayActions,
					addRentDebt(actorTgoId, claim.position, Math.floor(claim.rentDebt)),
				], payingRent + Math.floor(claim.rentDebt)
			] : [claimRentPayActions, payingRent]
		, [[], 0]
	);
	const paidRentState = rootReducer(state, transaction({ tgoId: actorTgoId, items: [{ typeId: 'money' as TypeId, count: -payingRent }] }));
	if (paidRentState === state)
		return state;
	const paidClaimsRentState = addRentDebtActions.reduce<RootStateType>((s, a) => rootReducer(s, a), paidRentState);
	const distributedMoneyState = rootReducer(paidClaimsRentState, governmentActions.distribute(payingRent));

	return distributedMoneyState;
};
