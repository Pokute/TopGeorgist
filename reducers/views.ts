import { importToArray } from 'import-to-array';
import { type ActionType, getType, isActionOf } from 'typesafe-actions';

import * as viewActions from '../actions/view.ts';
import * as viewsActions from '../actions/views.ts';
import viewReducer, { type ViewType, viewActionList } from './view.ts';
import view from './view.ts';
import { type AnyAction } from 'redux';

export type ViewsState = {
	readonly [viewId: string]: ViewType;
};

const initialState: ViewsState = {};

type ViewAction = ActionType<typeof viewActions>;
type ViewsAction = ActionType<typeof viewsActions>;

const listActions = [
	viewsActions.create,
].map(a => getType(a));

export default (state: ViewsState = initialState, action: ViewAction | ViewsAction) => {
		// Handle single view changes here.
/* 	if (listActions.some(a => a === action.type)) {
		const viewAction = action as ViewAction;
		const newSubObject = viewReducer(state[viewAction.payload.viewId], viewAction);
		if (newSubObject !== state[viewAction.payload.viewId]) {
			return {
				...state,
				[(action as ViewAction).payload.viewId]: newSubObject,
			};
		}
		return state;
	}
 */
	switch (action.type) {
		case getType(viewsActions.create): {
			return {
				...state,
				[action.payload.view.viewId]: action.payload.view,
			};
		}
		default:
			if (isActionOf(viewActions.clickActionStack.push, action)
				|| isActionOf(viewActions.clickActionStack.pop, action)
			) {
				const newViewState = viewReducer(state[action.payload.viewId], action);
				if (newViewState !== state[action.payload.viewId]) {
					return {
						...state,
						[action.payload.viewId]: newViewState,
					};
				}
			}
			return state;
	}
};
