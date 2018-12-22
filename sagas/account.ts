import { put, select, takeEvery } from 'redux-saga/effects';
import { getType, ActionType } from 'typesafe-actions';

import { set as allSet } from '../actions/allSet';
import * as accountsActions from '../actions/accounts';
import topGeorgist from '../reducers';
import { AccountType } from '../reducers/account';
import { setAccountId } from '../actions/defaults';

const handleAccountCreateRequestWithClient = function* ({ payload: { clientId, username, password }}: ActionType<typeof accountsActions.accountRequestWithClient>) {
	if (!global.isServer) return;
	console.log('Received accountCreateRequest ', username);
	const state: ReturnType<typeof topGeorgist> = yield select();
	if (username) {
		const hasNameConflict = Object.values(state.accounts)
			.some(({ username: searchUsername }: AccountType) => searchUsername === username);
		if (hasNameConflict) return;
	}

	const socket = state.clients[clientId].socket;
	const addAccountAction = accountsActions.add({
		password,
		playerTgoId: '',
		username,
	});
	const newAccountId = addAccountAction.payload.account.accountId;
	yield put(addAccountAction);

	const finalState: ReturnType<typeof topGeorgist> = yield select();
	socket.sendAction(allSet({
		...finalState,
		accounts: {
			newAccountId: finalState.accounts[newAccountId]
		},
		clients: {},
	}));
	socket.sendAction(setAccountId(newAccountId));
};

const playerListener = function* () {
	yield takeEvery(getType(accountsActions.accountRequestWithClient), handleAccountCreateRequestWithClient);
};

export default playerListener;
