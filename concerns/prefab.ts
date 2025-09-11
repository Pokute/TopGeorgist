import { createAction, getType } from 'typesafe-actions';

import type { Opaque } from '#tg/typings/global.d.ts';
import { type IntegrationTemplates } from './tgos.ts';

export type PrefabId = Opaque<string, 'PrefabId'>;

export type PrefabsState = Record<string, IntegrationTemplates>;

export const initialPrefabsState: PrefabsState = {
};

export const prefabsActions = {
	add: createAction('PREFAB_ADD', ({ name, integrateTemplates }: { name: PrefabId, integrateTemplates: IntegrationTemplates }) => ({
		name,
		integrateTemplates,
	}))(),
	remove: createAction('PREFAB_REMOVE', (name: PrefabId) => ({
		name,
	}))(),
} as const;

export type PrefabAction = ReturnType<typeof prefabsActions[keyof typeof prefabsActions]>;

export function prefabsReducer(
	state: PrefabsState = initialPrefabsState,
	action: PrefabAction
): PrefabsState {
	switch (action.type) {
		case getType(prefabsActions.add):
			return ({
				...state,
				[action.payload.name]: action.payload.integrateTemplates,
			});
		case getType(prefabsActions.remove):
			const { [action.payload.name]: _, ...rest } = state;
			return rest;
		default:
			return state;
	}
};
