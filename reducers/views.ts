import { importToArray } from 'import-to-array';
import { ActionType, getType, isActionOf } from 'typesafe-actions';

import * as viewActions from '../actions/view';
import * as viewsActions from '../actions/views';
import viewReducer, { ViewType } from './view';

export type ViewsState = {
	[extraProps: string]: ViewType;
};

const initialState: ViewsState = {};

type ViewAction = ActionType<typeof viewActions>;
type ViewsAction = ActionType<typeof viewsActions>;

const listActions = [
	viewsActions.create,
].map(a => getType(a));

export default (state: ViewsState = initialState, action: ViewAction | ViewsAction) => {
	// Handle single view changes here.
	if (listActions.some(a => a === action.type)) {
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

	switch (action.type) {
		case getType(viewsActions.create): {
			return {
				...state,
				[(action as ViewsAction).payload.view.viewId]: (action as ViewsAction).payload.view,
			};
		}
		default:
			return state;
	}
};
