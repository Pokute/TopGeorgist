import { ActionType, getType } from "typesafe-actions";
import { TgoId } from "./tgo";
import { clickActionStack } from "../actions/view";

import { ViewsState } from './views';
import * as viewActions from '../actions/view';

export type ViewId = keyof ViewsState;

export const viewActionList = [
	viewActions.setPosition,
	viewActions.setSize,
	viewActions.setFollowTarget,
	viewActions.clickActionStack.push,
	viewActions.clickActionStack.pop,
];

type ViewAction = ActionType<typeof viewActions>;

export interface ViewInitialType {
	canvas?: HTMLCanvasElement,
	canvasId?: string,
	followTgoId?: TgoId,
	position: {
		x: number,
		y: number,
	},
	size: {
		x: number,
		y: number,
	},
	clickActionStack: any[],
};

export interface ViewType extends ViewInitialType {
	viewId: ViewId,
};

export const initialState: ViewInitialType = {
	canvas: undefined,
	followTgoId: undefined,
	position: {
		x: 0,
		y: 0,
	},
	size: {
		x: 100,
		y: 100,
	},
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
