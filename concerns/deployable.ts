import { type ActionType, createAction, getType } from 'typesafe-actions';
import { type TgoId, type TgoRoot, type TgoType } from '../reducers/tgo.ts';
import { type TypeId } from '../reducers/itemType.ts';
import rootReducer, { type RootStateType } from '../reducers/index.ts';
import { add, remove as tgoRemove } from './tgos.ts';
import { selectTgo } from './tgos.ts';
import { type ComponentPosition, hasComponentPosition } from '../components/position.ts';
import { hasComponentMapGridOccipier, hasComponentVisitable } from '../data/components_new.ts';
import { mapPosition } from './map.ts';
import { transaction } from './transaction.ts';
import { type ComponentInventory, hasComponentInventory } from './inventory.ts';

export type ComponentDeployable = TgoRoot & {
	readonly deployable?: boolean,
};

export const hasComponentDeployable = <BaseT extends TgoType>(tgo?: BaseT) : tgo is (BaseT & Required<ComponentDeployable>) =>
	tgo?.deployable !== undefined;

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

	const freePlot = Object.values(state.tgos)
		.filter(tgo => (
			hasComponentPosition(tgo) && tgo.position && mapPosition.matching(tgo.position, actor.position)
		))
		.every(tgo => !hasComponentMapGridOccipier(tgo))
	if (!freePlot)
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

	const addDeployedAction = add({
		mapGridOccupier: true,
		position: actor.position,
		presentation: { color: 'orange' },
		label: targetType.label,
		visitable: {
			label: `Here: ${targetType.label}`,
			actions: [
				{
					label: targetType.deployable.collectVerb ?? 'Pick up',
					onClick: {
						type: getType(collect),
					},
				},
			],
		},
		inventory: Array.from(targetType.deployable.deployInventory),
		...targetType.deployable.deployAdditionals
	});
	const deployedTgoId = addDeployedAction.payload.tgo.tgoId;
	const stateWithDeployedTgo = rootReducer(stateWithTransaction, addDeployedAction);

	return stateWithDeployedTgo;
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
