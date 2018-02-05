import store from '../store';
import { put, select, takeEvery } from 'redux-saga/effects';
// import * as playerActions from '../actions/player';
import * as tgoActions from '../actions/tgo';

const handlePlayerCreateRequest = function*(action) {
	if (!global.isServer) return;
	const hasNameConflict = (yield select(state => state.tgos))
		.some(tgo => (tgo.typeId === 'player') && (tgo.label === action.label))
	if (!hasNameConflict) {
		yield store.dispatch(tgoActions.add({
			tgoId: 'derp',
			label: action.label,
		}));

		global.ws
	}
};

const playerListener = function*() {
	yield takeEvery('PLAYER_CREATE_REQUEST', handlePlayerCreateRequest);
};

export default playerListener;
