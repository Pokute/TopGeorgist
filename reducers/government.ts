import { ActionType, getType } from 'typesafe-actions';

import * as allSetActions from '../actions/allSet';
import * as tickerActions from '../actions/ticker';
import * as governmentActions from '../actions/government';
import { TgoId } from "./tgo";

export interface GovernmentStateType {
	citizens: CitizensStateType,
	claims: ClaimStateType[],
	rentModulus: number,
};

const initialState = {
	citizens: {},
	claims: [],
	rentModulus: 0,
};

export interface CitizenStateType {
	tgoId: TgoId,
	stipend: number,
};

export interface CitizensStateType {
	[extraProps: string]: CitizenStateType;
};

const initialCitizenState = {
	tgoId: '',
	stipend: 50,
};

export interface ClaimStateType {
	tgoId: TgoId,
	position: {
		x: number,
		y: number,
	},
	rentDebt: number,
};

const initialClaimState = {
	tgoId: undefined,
	position: undefined,
	rentDebt: 0,
};

const rentPerTick = 0.5;

type GovernmentAction = ActionType<typeof governmentActions>;
type TickerAction = ActionType<typeof tickerActions>;
type AllSetAction = ActionType<typeof allSetActions>;

export default (state: GovernmentStateType = initialState, action: GovernmentAction | TickerAction | AllSetAction): GovernmentStateType => {
	switch (action.type) {
		case (getType(governmentActions.addCitizen)):
			const citizen = state.citizens[action.payload];
			if (citizen) return state; // Already a citizen.

			return {
				...state,
				citizens: {
					...state.citizens,
					[action.payload]: {
						...initialCitizenState,
						tgoId: action.payload,
					},
				},
			};
		case (getType(governmentActions.removeCitizen)):
			const { [action.payload]: undefined, ...rest } = state.citizens;
			return {
				...state,
				citizens: rest,
			};
		case (getType(governmentActions.distribute)): {
			const totalMoney = (action.payload + state.rentModulus);
			const citizenCount = Object.keys(state.citizens).length;
			const moneyPerCitizen = Math.trunc(totalMoney / citizenCount);
			return {
				...state,
				citizens: Object.values(state.citizens)
					.map(c => ({ ...c, stipend: c.stipend + moneyPerCitizen }))
					.reduce((acc, c) => ({ ...acc, [c.tgoId]: c }), {}),
				rentModulus: totalMoney - (moneyPerCitizen * citizenCount),
			};
		}
		case (getType(governmentActions.addRentModulus)):
			return {
				...state,
				rentModulus: state.rentModulus + action.payload,
			};
		case (getType(governmentActions.rent)):
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
		case (getType(governmentActions.addStipend)): {
			const citizen = state.citizens[action.payload.tgoId];
			if (!citizen) return state;
			return {
				...state,
				citizens: {
					...state.citizens,
					[action.payload.tgoId]: {
						...citizen,
						stipend: citizen.stipend + action.payload.amount
					},
				},
			};
		}
		case (getType(tickerActions.tick)):
			return {
				...state,
				claims: state.claims.map(c => ({
					...c,
					rentDebt: c.rentDebt + rentPerTick,
				})),
			};
		case (getType(allSetActions.set)):
			return action.payload.government;
		default:
			return state;
	}
};
