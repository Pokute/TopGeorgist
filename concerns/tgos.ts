import { v4 as uuidv4 } from 'uuid';
import { type ActionType, createAction, getType, isActionOf } from 'typesafe-actions';

import { type RootStateType } from '../reducers/index.ts';
import * as tgoActions from '../actions/tgo.ts'; 
import tgoReducer, { type TgoActionType, type TgoId, type TgoPartials, type TgoType, initialState as tgoInitialState, } from '../reducers/tgo.ts';
import { hasComponentInventory, inventoryActions, type InventoryActionType, reducer as inventoryReducer } from './inventory.ts';
import { hasComponentPosition, setPosition, reducer as positionReducer } from '../components/position.ts';
import { type GoalActionType, type GoalDoerActionType, goalDoerActionList, goalActionList } from './goal.ts';

export type TgosState = {
	readonly [tgoId: string]: TgoType;
};

const initialState: TgosState = {};

export const setAll = createAction('TGOS_SET',
	(tgos: TgosState) => ({
		tgos,
	})
)();

export const add = createAction('TGO_ADD',
	(tgo: TgoPartials) => ({
		tgo: {
			...tgo,
			// tgoId: uuidv4() as TgoId,
			tgoId: tgo.tgoId ?? uuidv4() as TgoId,
		},
	})
)();

export const remove = createAction('TGO_REMOVE',
	(tgoId: TgoId) => ({
		tgoId,
	})
)();

export const tgosActions = {
	setAll,
	add,
	remove,
};

type TgosAction = ActionType<typeof tgosActions>;

const singleTgoReducer = (state: TgosState = initialState, action: TgoActionType | InventoryActionType): TgosState => {
	return state;
}

const componentReducers = [
	{
		test: hasComponentPosition,
		reducer: positionReducer,
	},
	{
		test: hasComponentInventory,
		reducer: inventoryReducer,
	},
];

export const tgosReducer = (state: TgosState = initialState, action: TgosAction | TgoActionType | InventoryActionType | GoalActionType | GoalDoerActionType): TgosState => {
	if (isActionOf(tgoActions.setColor, action)) {
		return singleTgoReducer(state, action);
	}
	switch (action.type) {
		case getType(tgosActions.add):
			return {
				...state,
				[action.payload.tgo.tgoId]: {
					...tgoInitialState,
					...action.payload.tgo,
				},
			};
		case getType(tgosActions.remove): 
		{
			const { [action.payload.tgoId]: undefined, ...rest } = state;
			return rest;
		}
		case getType(tgosActions.setAll):
			return action.payload.tgos;
		default:
			if (isActionOf(setPosition, action)
				|| isActionOf(tgoActions.setColor, action)
				|| isActionOf(inventoryActions.add, action)
				|| isActionOf(inventoryActions.addTgoId, action)
				|| isActionOf(inventoryActions.removeTgoId, action)
				|| isActionOf(goalDoerActionList.addGoals, action)
				|| isActionOf(goalDoerActionList.removeGoals, action)
			) {
				const newTgoState = tgoReducer(state[action.payload.tgoId], action);
				if (newTgoState !== state[action.payload.tgoId]) {
					return {
						...state,
						[action.payload.tgoId]: newTgoState,
					};
				}
			}
			if (isActionOf(goalActionList.pauseGoal, action)
				|| isActionOf(goalActionList.resumeGoal, action)
			) {
				return {
					...state,
					[action.payload.goalTgoId]: tgoReducer(state[action.payload.goalTgoId], action)
				};
			}

		return state;
	}
};

export const getTgoByIdFromRootState = (tgos: TgosState) =>
	(tgoId: TgoId): TgoType | undefined =>
		tgos[tgoId];

export const selectTgo = (state: RootStateType, tgoId: TgoId) =>
	state.tgos[tgoId];

// Using this like allows to use type guarding funcs like hasComponentInventory for arrays of tuples.
// Example: Object.entries(tgos).filter(createTupleFilter(hasComponentInventory))
export const createTupleFilter = <DerivedT extends BaseT, BaseT extends TgoType>(filterFunc: (tgo?: BaseT) => tgo is DerivedT) => (tgoTuple: [tgoId: string, tgoz?: BaseT]) : tgoTuple is [string, (BaseT & Required<DerivedT>)] =>
	filterFunc(tgoTuple[1]);
