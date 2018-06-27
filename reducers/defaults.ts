import IAction from './action';

type TgoId = string;
type ViewId = string;

export interface type {
	readonly playerTgoId?: TgoId,
	readonly viewId?: ViewId,
};

const initialState: type = {
	playerTgoId: undefined,
	viewId: undefined,
};

export interface IDefaultSetPlayer extends IAction {
	playerTgoId?: TgoId,
}

export interface IDefaultSetView extends IAction {
	viewId?: ViewId,
}

type DefaultsAction =
	IDefaultSetPlayer |
	IDefaultSetView
;

export default (state: type = initialState, action: DefaultsAction) => {
	switch (action.type) {
		case 'DEFAULTS_SET_PLAYER': {
			const setPlayerAction = action as IDefaultSetPlayer;
			return {
				...state,
				playerTgoId: setPlayerAction.playerTgoId,
			};
		}
		case 'DEFAULTS_SET_VIEW': {
			const setViewAction = action as IDefaultSetView;
			return {
				...state,
				viewId: setViewAction.viewId,
			};
		}
		default:
			return state;
	}
};
