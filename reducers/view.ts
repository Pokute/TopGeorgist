import { type ActionType, getType } from 'typesafe-actions';
import { type TgoId } from './tgo.ts';
import { clickActionStack } from '../actions/view.ts';

import { type ViewsState } from './views.ts';
import * as viewActions from '../actions/view.ts';
import { type MapPosition, type MapSize } from '../concerns/map.ts';
import type { Opaque } from '../typings/global.d.ts';

export type ViewId = Opaque<string, 'ViewId'>;

export const viewActionList = [
	viewActions.setPosition,
	viewActions.setSize,
	viewActions.setFollowTarget,
	viewActions.clickActionStack.push,
	viewActions.clickActionStack.pop,
];

type ViewAction = ActionType<typeof viewActions>;

export interface ViewInitialType {
	readonly canvas?: HTMLCanvasElement,
	readonly canvasId?: string,
	readonly followTgoId?: TgoId,
	readonly position: MapPosition,
	readonly size: MapSize,
	readonly clickActionStack: ReadonlyArray<any>,
};

export interface ViewType extends ViewInitialType {
	readonly viewId: ViewId,
};

export const initialState: ViewInitialType = {
	canvas: undefined,
	followTgoId: undefined,
	position: {
		x: 0,
		y: 0,
	} as MapPosition,
	size: {
		x: 100,
		y: 100,
	} as MapSize,
	clickActionStack: [],
};

export default (state: ViewType, action: ViewAction): ViewType => {
	switch (action.type) {
		case getType(viewActions.setPosition):
			return {
				...state,
				position: action.payload.position,
			};
		case getType(viewActions.setSize):
			return {
				...state,
				size: action.payload.size,
			};
		case getType(viewActions.setFollowTarget):
			return {
				...state,
				followTgoId: action.payload.tgoId,
			};
		case getType(viewActions.clickActionStack.push):
			return {
				...state,
				clickActionStack: [...state.clickActionStack, action.payload.action],
			};
		case getType(viewActions.clickActionStack.pop):
			return {
				...state,
				clickActionStack: state.clickActionStack.slice(0, -1),
			};
		default:
			return state;
	}
};
