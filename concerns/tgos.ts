import { v4 as uuidv4 } from 'uuid';
import { type ActionType, createAction, getType, isActionOf } from 'typesafe-actions';

import { type RootStateType } from '../reducers/index.ts';
import * as tgoActions from '../actions/tgo.ts'; 
import tgoReducer, { type TgoActionType, type TgoId, type TgoPartials, type TgoType, initialState as tgoInitialState, } from '../reducers/tgo.ts';
import { hasComponentInventory, inventoryActions, type InventoryActionType, reducer as inventoryReducer } from './inventory.ts';
import { hasComponentPosition, setPosition, reducer as positionReducer, type ComponentPosition } from '../components/position.ts';
import { type GoalActionType, type GoalDoerActionType, goalDoerActionList, goalActionList } from './goal.ts';
import { type MapPosition } from './map.ts';

export type TgosState = {
	readonly [tgoId: string]: TgoType;
};

type Primitive = string | number | bigint | boolean | null | undefined;
type ReplaceType<T, TReplace, TWith, TKeep = Primitive> = T extends TReplace | TKeep
    ? (T extends TReplace
        ? TWith | Exclude<T, TReplace>
        : T)
    : {
        [P in keyof T]: ReplaceType<T[P], TReplace, TWith, TKeep>
    };

export type IntegrationTgoType =
	ReplaceType<
		ReplaceType<
			Omit<TgoType, 'position' | 'tgoId'>,
			TgoId,
			TgoId | IntegrateCustomTgoIdReplacement
		>,
		MapPosition,
		MapPosition | IntegrateCustomValueReplacement
	>
	& { readonly tgoId: IntegrateCustomTgoIdReplacement }
	& { readonly position?: IntegrateCustomValueReplacement | ComponentPosition['position'] };
export type IntegrationTemplates = ReadonlyArray<IntegrationTgoType>;

export type IntegrationTgoTypeWithTgoId = Omit<IntegrationTgoType, 'tgoId'> & { tgoId: TgoId | IntegrationTgoType['tgoId'] };

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

export const integrateTgoTemplatesReplace = createAction('TGO_INTEGRATE_TEMPLATES_REPLACE',
	(
		tgos: ReadonlyArray<IntegrationTgoTypeWithTgoId | TgoType>,
		replacementsCustoms: IntegrateReplacementsMapCustoms,
		parentTgoId?: IntegrateReplacementsMapHierarchial['__parentTgoId']
	) => ({
		tgos: integrateReplacer(tgos, replacementsCustoms, parentTgoId)
	})
)();

export const integrateTgoTemplatesMerge = createAction('TGO_INTEGRATE_TEMPLATES_MERGE',
	(
		tgos: ReadonlyArray<IntegrationTgoTypeWithTgoId | TgoType>,
		replacementsCustoms: IntegrateReplacementsMapCustoms,
		parentTgoId?: IntegrateReplacementsMapHierarchial['__parentTgoId']
	) => ({
		tgos: integrateReplacer(tgos, replacementsCustoms, parentTgoId)
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
	integrateTgoTemplatesReplace,
	integrateTgoTemplatesMerge,
} as const;

type TgosAction = ActionType<typeof tgosActions>;

const singleTgoReducer = (state: TgosState = initialState, action: TgoActionType | InventoryActionType): TgosState => {
	return state;
}

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
		case getType(tgosActions.integrateTgoTemplatesReplace):
			return {
				...state,
				...Object.fromEntries(
					action.payload.tgos.map(tgo => [tgo.tgoId, tgo])
				),
			};
		case getType(tgosActions.integrateTgoTemplatesMerge):
			throw new Error('Not implemented');
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

type IntegrateReplacementsMapHierarchial = {
	'__parentTgoId'?: TgoId,
	'__thisTgoId'?: TgoId,
};
export const integrateCustomTgoIdReplacementPrefix = '__customTgoId_' as const;
export type IntegrateCustomTgoIdReplacement = `${typeof integrateCustomTgoIdReplacementPrefix}${string}`;
export const integrateCustomValueReplacementPrefix = '__customValue_' as const;
export type IntegrateCustomValueReplacement = `${typeof integrateCustomValueReplacementPrefix}${string}`;
export type IntegrateCustomReplacement = IntegrateCustomTgoIdReplacement | IntegrateCustomValueReplacement;

type IntegrateReplacementsMapCustoms = {
	[k: IntegrateCustomTgoIdReplacement]: TgoId,
	[k: IntegrateCustomValueReplacement]: any,
};

export const integrateReplacer = function (
	targetObject: ReadonlyArray<TgoType | IntegrationTgoTypeWithTgoId>,
	initialReplacementsCustoms: IntegrateReplacementsMapCustoms,
	initialParentTgoId?: IntegrateReplacementsMapHierarchial['__parentTgoId']
): ReadonlyArray<TgoType> {
	// const findReplacement = (replacementMapCustoms: IntegrateReplacementsMapCustoms, replacementMapHierarchial: IntegrateReplacementsMapHierarchial, key: string): TgoId => {
	// 	if (key === '__thisTgoId')
	// 		return uuidv4() as TgoId;
	// 	if (Object.hasOwn(replacementMapCustoms, key))
	// 		return replacementMapCustoms[key];
	// 	if (Object.hasOwn(replacementMapHierarchial, key))
	// 		return replacementMapHierarchial[key];
	// 	if (key.startsWith(integrateCustomTgoIdReplacementPrefix)) // Not already in replacements map
	// 		return uuidv4() as TgoId;
	// 	return key as TgoId; // Not a replacement key
	// };

	const updateReplacementMap = (replacementMapCustoms: IntegrateReplacementsMapCustoms, key: string): IntegrateReplacementsMapCustoms => {
		if (Object.hasOwn(replacementMapCustoms, key))
			return replacementMapCustoms;
		
		return ({
			...replacementMapCustoms,
			...(key.startsWith(integrateCustomTgoIdReplacementPrefix) ? { [key]: uuidv4() as TgoId } : {}),
		});
	};

	const getReplacement = (replacementMapCustoms: IntegrateReplacementsMapCustoms, replacementMapHierarchial: IntegrateReplacementsMapHierarchial, key: string): TgoId =>
		(({...replacementMapCustoms, ...replacementMapHierarchial})[key] ?? key) as TgoId;
	
	var currentReplacementsCustoms: IntegrateReplacementsMapCustoms = { ...initialReplacementsCustoms }; // mutable

	const recursiveReplacer = (targetObject: any, currentReplacementsHierarchial: IntegrateReplacementsMapHierarchial): any => {
		switch (typeof targetObject) {
			case 'string':
				currentReplacementsCustoms = updateReplacementMap(currentReplacementsCustoms, targetObject);
				return getReplacement(currentReplacementsCustoms, currentReplacementsHierarchial, targetObject);
			case 'object':
				if (targetObject.tgoId && (targetObject.tgoId === '__thisTgoId' || targetObject.tgoId.startsWith(integrateCustomTgoIdReplacementPrefix))) {
					currentReplacementsCustoms = updateReplacementMap(currentReplacementsCustoms, targetObject.tgoId);

					const thisTgoId = getReplacement(currentReplacementsCustoms, currentReplacementsHierarchial, targetObject.tgoId);

					// Rerun replace on the same object with new replacement map.
					return recursiveReplacer(
						({
							...targetObject,
							tgoId: thisTgoId,
						}),
						({
							__parentTgoId: currentReplacementsHierarchial.__thisTgoId!,
							__thisTgoId: thisTgoId,
						})
					);
				}

				if (targetObject instanceof Map) {
					return new Map(
						Array.from(targetObject.entries()).map(([key, value]) => [
							recursiveReplacer(key, currentReplacementsHierarchial),
							recursiveReplacer(value, currentReplacementsHierarchial),
						])
					);
				}

				if (targetObject instanceof Set) {
					return new Set(
						Array.from(targetObject.values()).map(value => recursiveReplacer(value, currentReplacementsHierarchial))
					);
				}

				if (Array.isArray(targetObject)) {
					return targetObject.map(item => recursiveReplacer(item, currentReplacementsHierarchial));
				}

				return Object.fromEntries(
					Object.entries(targetObject).map(([key, value]) => [
						recursiveReplacer(key, currentReplacementsHierarchial),
						recursiveReplacer(value, currentReplacementsHierarchial),
					])
				);
			default:
				return targetObject;
		}
	};

	return recursiveReplacer(targetObject,
		{
			__parentTgoId: initialParentTgoId,
		}
	);
};
