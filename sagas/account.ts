import { put, select, takeEvery } from 'redux-saga/effects';
import { getType, ActionType } from 'typesafe-actions';

import { set as allSet } from '../actions/allSet';
import * as accountActions from '../actions/account';
import * as accountCommActions from '../actions/accountComm';
import * as accountsActions from '../actions/accounts';
import topGeorgist from '../reducers';
import { AccountType } from '../reducers/account';
import { setAccountId, setPlayerTgoId } from '../actions/defaults';
import { WithClient } from '../actions/withClient';

const handleAccountCreateRequestWithClient = function* ({ payload: { clientId, username, password }}: ActionType<typeof accountsActions.accountRequestWithClient>) {
	if (!global.isServer) return;
	console.log('Received accountCreateRequest ', username);
	const state: ReturnType<typeof topGeorgist> = yield select();
	if (username) {
		const hasNameConflict = Object.values(state.accounts)
			.some(({ username: searchUsername }: AccountType) => searchUsername === username);
		if (hasNameConflict) return;
	}

	const addAccountAction = accountsActions.add({
		password,
		playerTgoId: '',
		username,
		tokens: [],
	});
	const newAccountId = addAccountAction.payload.account.accountId;
	yield put(addAccountAction);
	const createTokenAction = accountActions.createToken({
		accountId: newAccountId,
	});
	yield put(createTokenAction);

	const finalState: ReturnType<typeof topGeorgist> = yield select();
	const socket = state.clients[clientId].socket;
	socket.sendAction(allSet({
		...finalState,
		accounts: {
			[newAccountId]: finalState.accounts[newAccountId],
		},
		clients: {},
	}));
	socket.sendAction(setAccountId(newAccountId, createTokenAction.payload.token));
};

const handleAccountLogin = function* ({ payload: { clientId, username, password }}: WithClient<ActionType<typeof accountCommActions.login>>) {
	if (!global.isServer) return;
	if (!username || !password) return;

	const state: ReturnType<typeof topGeorgist> = yield select();
	const foundAccount = Object.values(state.accounts).find(account => account.username === username && account.password === password);

	if (!foundAccount) return;

	const createTokenAction = accountActions.createToken({
		accountId: foundAccount.accountId,
	});
	yield put(createTokenAction);

	const socket = state.clients[clientId].socket;
	socket.sendAction(allSet({
		...state,
		accounts: {
			[foundAccount.accountId]: foundAccount,
		},
		clients: {},
	}));
	socket.sendAction(setAccountId(foundAccount.accountId, createTokenAction.payload.token));
	socket.sendAction(setPlayerTgoId(foundAccount.playerTgoId));
}

const handleAccountLoginWithToken = function* ({ payload: { clientId, token }}: WithClient<ActionType<typeof accountCommActions.loginWithToken>>) {
	if (!global.isServer) return;
	if (!token) return;

	const state: ReturnType<typeof topGeorgist> = yield select();
	const foundAccount = Object.values(state.accounts).find(account => account.tokens.includes(token));

	if (!foundAccount) return;

	const socket = state.clients[clientId].socket;
	socket.sendAction(allSet({
		...state,
		accounts: {
			[foundAccount.accountId]: foundAccount,
		},
		clients: {},
	}));
	socket.sendAction(setAccountId(foundAccount.accountId, token));
	socket.sendAction(setPlayerTgoId(foundAccount.playerTgoId));
}

const handleAccountCreateWithToken = function* ({ payload: { username, password, token }}: ActionType<typeof accountCommActions.createAccountWithToken>) {
	if (!global.isServer) return;
	console.log('Received handleAccountCreateWithToken ', username);
	const state: ReturnType<typeof topGeorgist> = yield select();
	const foundAccount = Object.values(state.accounts).find(account => account.tokens.includes(token));
	if (!foundAccount) {
		// Account with that token not found!
		return;
	}
	if (foundAccount.username !== '') {
		// Account already created!
		return;
	}
	if (username) {
		const hasNameConflict = Object.values(state.accounts)
			.some(({ username: searchUsername }: AccountType) => searchUsername === username);
		if (hasNameConflict) return;
	}
	if (!password) {
		return;
	}

	yield put(accountActions.upgradeAccount({
		accountId: foundAccount.accountId,
		username,
		password,
	}));
}

const playerListener = function* () {
	yield takeEvery(getType(accountsActions.accountRequestWithClient), handleAccountCreateRequestWithClient);
	yield takeEvery(`${getType(accountCommActions.login)}_WITH_CLIENT`, handleAccountLogin);
	yield takeEvery(`${getType(accountCommActions.loginWithToken)}_WITH_CLIENT`, handleAccountLoginWithToken);
	yield takeEvery(getType(accountCommActions.createAccountWithToken), handleAccountCreateWithToken);
};

export default playerListener;
