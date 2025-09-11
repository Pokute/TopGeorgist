import { type ActionType, createAction, getType } from 'typesafe-actions';
import { type TgoId, type TgoRoot, type TgoType } from '../reducers/tgo.ts';
import { type TypeId } from '../reducers/itemType.ts';
import rootReducer, { type RootStateType } from '../reducers/index.ts';
import { integrateTgoTemplatesReplace, remove as tgoRemove } from './tgos.ts';
import { selectTgo } from './tgos.ts';
import { type ComponentPosition, hasComponentPosition } from '../components/position.ts';
import { hasComponentMapGridOccipier, hasComponentVisitable } from '../data/components_new.ts';
import { mapPosition } from './map.ts';
import { transaction } from './transaction.ts';
import { type ComponentInventory, hasComponentInventory } from './inventory.ts';
import { type PrefabId } from './prefab.ts';

export type DeployableType = {
	readonly deployPrefabId: PrefabId,
	readonly deployVerb?: string,
	readonly deployInventory?: never,
	readonly deployAdditionals?: never,
};

// Actions:

export const deployType = createAction('DEPLOY_TYPE',
	({ tgoId, deployedTypeId }: { tgoId: TgoId, deployedTypeId: TypeId }) => ({
		tgoId,
		deployedTypeId,
	})
)();

export const deployTgo = createAction('DEPLOY_TGO',
	({ tgoId, deployedTgoId }: { tgoId: TgoId, deployedTgoId: TgoId }) => ({
		tgoId,
		deployedTgoId,
	})
)();

export const collect = createAction('COLLECT',
	({ tgoId, visitableTgoId }: { tgoId: TgoId, visitableTgoId: TgoId }) => ({
		tgoId,
		visitableTgoId,
	})
)();

export const deployableActions = {
	deployType,
	deployTgo,
	collect,
};
export type DeployableActionType = ActionType<typeof deployableActions>;

// Reducer:

const deploy = (state: RootStateType, actorTgo: ComponentPosition & ComponentInventory, _: any): RootStateType => {
	return state;
};

export const deployTypeReducer = (state: RootStateType, { payload: { tgoId, deployedTypeId }}: ActionType<typeof deployType>): RootStateType => {
	const actor = selectTgo(state, tgoId);
	const targetType = state.itemTypes[deployedTypeId]
	if (!hasComponentPosition(actor) || !targetType?.deployable)
		return state;

	const freeMapPlot = Object.values(state.tgos)
		.filter(tgo => (
			hasComponentPosition(tgo) && tgo.position && mapPosition.matching(tgo.position, actor.position)
		))
		.every(tgo => !hasComponentMapGridOccipier(tgo))
	if (!freeMapPlot)
		return state;

	const stateWithTransaction = rootReducer(state, transaction({
		tgoId,
		items: [
			{
				typeId: deployedTypeId,
				count: -1,
			},
		],
	}));
	if (stateWithTransaction === state)
		return state;

	const instatiatable = stateWithTransaction.prefabs[targetType.deployable.deployPrefabId];
	if (!instatiatable) return stateWithTransaction;
	return rootReducer(
		stateWithTransaction, 
		integrateTgoTemplatesReplace(instatiatable, { __customValue_position: actor.position }, undefined)
	);
};

export const deployTgoReducer = (state: RootStateType, { payload: { tgoId, deployedTgoId }}: ActionType<typeof deployTgo>): RootStateType => {
	return state;
};

export const collectReducer = (state: RootStateType, { payload: { tgoId: actorTgoId, visitableTgoId }}: ActionType<typeof collect>): RootStateType => {
	const actorTgo = selectTgo(state, actorTgoId);
	const visitableTgo = selectTgo(state, visitableTgoId);
	if (
		!actorTgo
		|| !hasComponentPosition(actorTgo)
		|| !hasComponentInventory(actorTgo)
		|| !visitableTgo
		|| !hasComponentPosition(visitableTgo)
		|| !hasComponentVisitable(visitableTgo)
		|| !mapPosition.matching(actorTgo.position, visitableTgo.position)
	)
		return state;

	const stateWithTransaction = rootReducer(state, transaction({
		tgoId: actorTgoId,
		items: (visitableTgo.inventory ?? [])
			.filter(ii => state.itemTypes[ii.typeId].collectable),
	}));
	if (stateWithTransaction === state)
		return state;

	const stateWithRemove = rootReducer(stateWithTransaction, tgoRemove(visitableTgoId));
	if (stateWithRemove === stateWithTransaction)
		return state;

	return stateWithRemove;
};
