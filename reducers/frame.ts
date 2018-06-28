import { ActionType, getType } from "typesafe-actions";

import * as frameActions from '../actions/frame';

export interface FrameStateType {
	current: number,
	frameTime: number, 
};

const initialState: FrameStateType = {
	current: 0,
	frameTime: Date.now(),
};

type FrameAction = ActionType<typeof frameActions>;

export default (state = initialState, action: FrameAction) => {
	switch (action.type) {
		case getType(frameActions.frame):
			return {
				...state,
				current: state.current + 1,
				frameTime: action.payload.frameTime,
			};
		default:
			return state;
	}
};
