import { ActionType, createAction, getType } from 'typesafe-actions';
import { call, fork, put }  from 'typed-redux-saga';

import isServer from '../isServer.js'

// Actions:

export const frame = createAction('FRAME',
	() => ({
		frameTime: Date.now(),
	})
)();

// Sagas:

const reqWinFrame = () => new Promise(resolve => window.requestAnimationFrame(resolve));

const frameLoop = function* () {
	while (true) {
		yield* call(reqWinFrame);
		yield* put(frame());
	}
};

export const frameRootSaga = function* () {
	if (isServer) return;
	yield* fork(frameLoop);
};

// Reducer:

interface FrameStateType {
	readonly current: number,
	readonly frameTime: number, 
};

const initialState: FrameStateType = {
	current: 0,
	frameTime: Date.now(),
};

type FrameAction = ActionType<typeof frame>;

export const frameReducer = (state = initialState, action: FrameAction) => {
	switch (action.type) {
		case getType(frame):
			return {
				...state,
				current: state.current + 1,
				frameTime: action.payload.frameTime,
			};
		default:
			return state;
	}
};
