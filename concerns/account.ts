import type { Opaque } from '../typings/global.d.ts';
import forge from 'node-forge';
import { v4 as uuidv4 } from 'uuid';
import { createAction, type ActionType, getType } from 'typesafe-actions';
import { put, takeEvery }  from 'typed-redux-saga';

import { type TgoId } from '../reducers/tgo.ts';
import serverConfig from '../serverConfig.ts';
import isServer from '../isServer.ts'
import { set as allSet } from '../actions/allSet.ts';
import { setAccountId as setDefaultAccountId, setPlayerTgoId as setDefaultPlayerTgoId } from '../actions/defaults.ts';
import { type WithClient } from '../actions/withClient.ts';
import { select } from '../redux-saga-helpers.ts';
import { setConnected } from './clientToServerConnection.ts';
import * as netActions from './infra/net.ts';

// Actions:

export const serverSaltPassword = (username: string, clientSaltedPassword: string) => {;
	const md = forge.md.sha512.create();
	md.update(`${serverConfig.serverSalt}${username}${clientSaltedPassword}`);
	return md.digest().toHex();
};

export const setPlayerTgoId = createAction('ACCOUNT_SET_PLAYER_TGO_ID',
	({ accountId, playerTgoId }: { accountId: AccountId, playerTgoId: TgoId }) => ({
		accountId,
		playerTgoId,
	})
)();

export const createToken = createAction('ACCOUNT_CREATE_TOKEN',
	({ accountId }: { accountId: AccountId }) => ({
		accountId,
		token: uuidv4(),
	})
)();

export const deleteToken = createAction('ACCOUNT_DELETE_TOKEN',
	({ accountId, token }: { accountId: AccountId, token: Token }) => ({
		accountId,
		token,
	})
)();

export const upgradeAccount = createAction('ACCOUNT_UPGRADE',
	({ accountId, username, clientSaltedPassword }: { accountId: AccountId, username: AccountType['username'], clientSaltedPassword: AccountType['clientAndServerSaltedPassword'] }) => ({
		accountId,
		username,
		clientAndServerSaltedPassword: serverSaltPassword(username, clientSaltedPassword),
	})
)();

export const changePassword = createAction('ACCOUNT_CHANGE_PASSWORD',
	({ accountId, username, clientSaltedPassword, clientSaltedOldPassword }: { accountId: AccountId, username: AccountType['username'], clientSaltedPassword: AccountType['clientAndServerSaltedPassword'], clientSaltedOldPassword: AccountType['clientAndServerSaltedPassword'] }) => ({
		accountId,
		clientAndServerSaltedPassword: serverSaltPassword(username, clientSaltedPassword),
		clientAndServerSaltedOldPassword:  serverSaltPassword(username, clientSaltedOldPassword),
	})
)();

export const accountActions = {
	setPlayerTgoId,
	createToken,
	deleteToken,
	upgradeAccount,
	changePassword,
} as const;

type AccountAction = ActionType<typeof accountActions>;

export const setAll = createAction('ACCOUNT_SET',
	(accounts: AccountsState) => ({
		accounts,
	})
)();

export const add = createAction('ACCOUNT_ADD',
	(account: AccountTypePartial) => ({
		account: {
			...account,
			accountId: uuidv4() as AccountId,
		},
	})
)();

export const remove = createAction('ACCOUNT_REMOVE',
	(accountId: AccountId) => ({
		accountId: accountId,
	})
)();

export const accountRequest = createAction('ACCOUNT_CREATE_REQUEST',
	({ username, password }: { username: string, password: string }) => ({
		username,
		password,
	})
)();

export const accountRequestWithClient = createAction('ACCOUNT_CREATE_REQUEST_WITH_CLIENT',
	({ clientId, username, password }: { clientId: string, username: string, password: string }) => ({
		clientId,
		username,
		password,
	})
)();

export const accountsActions = {
	setAll,
	add,
	remove,
	accountRequest,
	accountRequestWithClient,
} as const;

// Actions for client->server communication:

const clientSaltPassword = (username: string, password: string) => {
	const clientSalt = 'TGCSalt-';
	const md = forge.md.sha512.create();
	md.update(`${clientSalt}${username}${password}`);
	return md.digest().toHex();
};

export const loginClientSalted = createAction('ACCOUNT_LOGIN_SALTED',
	({ username, password }: { username: AccountType['username'], password: AccountType['clientAndServerSaltedPassword'] }) => ({
		username,
		clientSaltedPassword: clientSaltPassword(username, password),
	})
)();

export const loginWithToken = createAction('ACCOUNT_LOGIN_WITH_TOKEN',
	({ token }: { token: Token }) => ({
		token,
	})
)();

export const createAccountWithTokenClientSalted = createAction('ACCOUNT_CREATE_WITH_TOKEN',
	({ username, password, token }: { username: AccountType['username'], password: AccountType['clientAndServerSaltedPassword'], token: Token }) => ({
		username,
		clientSaltedPassword: clientSaltPassword(username, password),
		token,
	})
)();

export const requestChangePasswordClientSalted = createAction('ACCOUNT_REQUEST_CHANGE_PASSWORD',
	({ username, password, oldPassword }: { username: AccountType['username'], password: AccountType['clientAndServerSaltedPassword'], oldPassword: AccountType['clientAndServerSaltedPassword'] }) => ({
		username,
		clientSaltedPassword: clientSaltPassword(username, password),
		clientSaltedOldPassword: clientSaltPassword(username, oldPassword),
	})
)();

// Sagas:

const handleAccountCreateRequestWithClient = function* ({ payload: { clientId, username: findUsername, password }}: ActionType<typeof accountsActions.accountRequestWithClient>) {
	if (!isServer) return;
	console.log('Received accountCreateRequest ', findUsername);
	const state = yield* select();
	if (findUsername) {
		const hasNameConflict = (Object.values(state.accounts) as AccountType[])
			.some(({ username: searchUsername }) => searchUsername === findUsername);
		if (hasNameConflict) return;
	}

	const addAccountAction = accountsActions.add({
		clientAndServerSaltedPassword: password,
		playerTgoId: '' as TgoId,
		username: findUsername,
		tokens: [],
	});
	const newAccountId = addAccountAction.payload.account.accountId;
	yield* put(addAccountAction);
	const createTokenAction = createToken({
		accountId: newAccountId,
	});
	yield* put(createTokenAction);

	const finalState = yield* select();
	const socket = state.clients[clientId].socket;
	socket.sendAction(allSet({
		...finalState,
		accounts: {
			[newAccountId]: finalState.accounts[newAccountId],
		},
		clients: {},
	}));
	socket.sendAction(setDefaultAccountId(newAccountId, createTokenAction.payload.token));
};

const handleAccountLogin = function* ({ payload: { clientId, username, clientSaltedPassword }}: WithClient<ActionType<typeof loginClientSalted>>) {
	if (!isServer) return;
	if (!username || !clientSaltedPassword) return;

	const state = yield* select();
	const foundAccount = (Object.values(state.accounts) as AccountType[])
		.find(account =>
			account.username === username
			&& account.clientAndServerSaltedPassword === serverSaltPassword(username, clientSaltedPassword));

	if (!foundAccount) return;

	const createTokenAction = createToken({
		accountId: foundAccount.accountId,
	});
	yield* put(createTokenAction);

	const socket = state.clients[clientId].socket;
	socket.sendAction(allSet({
		...state,
		accounts: {
			[foundAccount.accountId]: foundAccount,
		},
		clients: {},
	}));
	socket.sendAction(setDefaultAccountId(foundAccount.accountId, createTokenAction.payload.token));
	socket.sendAction(setDefaultPlayerTgoId(foundAccount.playerTgoId));
}

const handleAccountLoginWithToken = function* ({ payload: { clientId, token }}: WithClient<ActionType<typeof loginWithToken>>) {
	if (!isServer) return;
	if (!token) return;

	const state = yield* select();
	const foundAccount = (Object.values(state.accounts) as AccountType[]).find(account => account.tokens.includes(token));

	if (!foundAccount) return;

	const socket = state.clients[clientId].socket;
	socket.sendAction(allSet({
		...state,
		accounts: {
			[foundAccount.accountId]: foundAccount,
		},
		clients: {},
	}));
	socket.sendAction(setDefaultAccountId(foundAccount.accountId, token));
	socket.sendAction(setDefaultPlayerTgoId(foundAccount.playerTgoId));
}

const handleAccountCreateWithToken = function* ({ payload: { username, clientSaltedPassword, token }}: ActionType<typeof createAccountWithTokenClientSalted>) {
	if (!isServer) return;
	console.log('Received handleAccountCreateWithToken ', username);
	const state = yield* select();
	const foundAccount = (Object.values(state.accounts) as AccountType[]).find(account => account.tokens.includes(token));
	if (!foundAccount) {
		// Account with that token not found!
		return;
	}
	if (foundAccount.username !== '') {
		// Account already created!
		return;
	}
	if (username) {
		const hasNameConflict = (Object.values(state.accounts) as AccountType[])
			.some(({ username: searchUsername }: AccountType) => searchUsername === username);
		if (hasNameConflict) return;
	}
	if (!clientSaltedPassword) {
		return;
	}

	yield* put(upgradeAccount({
		accountId: foundAccount.accountId,
		username,
		clientSaltedPassword,
	}));
}

// This method practically only finds the accountId for the reducer.
const handleRequestChangePasswordClientSalted = function* ({ payload: { username, clientSaltedPassword, clientSaltedOldPassword }}: ActionType<typeof requestChangePasswordClientSalted>) {
	if (!isServer) return;

	const state = yield* select();
	const foundAccount = (Object.values(state.accounts) as AccountType[]).find(account => account.username === username);

	if (!foundAccount) {
		return;
	}

	yield* put(changePassword({
		accountId: foundAccount.accountId,
		username,
		clientSaltedPassword,
		clientSaltedOldPassword,
	}));
};

const sendTokenOnConnect = function* () {
	const token = window.localStorage.getItem('AccountToken');
	if (token) {
		yield* put(netActions.send(loginWithToken({ token })))
	}
};

export const accountRootSaga = function* () {
	if (isServer) {
		yield* takeEvery(getType(accountsActions.accountRequestWithClient), handleAccountCreateRequestWithClient);
		yield* takeEvery(`${getType(loginClientSalted)}_WITH_CLIENT`, handleAccountLogin);
		yield* takeEvery(`${getType(loginWithToken)}_WITH_CLIENT`, handleAccountLoginWithToken);
		yield* takeEvery(getType(createAccountWithTokenClientSalted), handleAccountCreateWithToken);
		yield* takeEvery(getType(requestChangePasswordClientSalted), handleRequestChangePasswordClientSalted);
	} else {
		// client
		yield* takeEvery(getType(setConnected), sendTokenOnConnect);
	}
};

// Account Reducer:

export type AccountId = Opaque<string, 'AccountId'>;
export type Token = string;

export interface AccountType {
	readonly accountId: AccountId,
	readonly playerTgoId: TgoId,
	readonly username: string,
	readonly clientAndServerSaltedPassword: string,
	readonly tokens: ReadonlyArray<Token>,
};

export type AccountTypePartial = Omit<AccountType, 'accountId'>;

const accountReducer = (state: AccountType, action: AccountAction): AccountType => {
	switch (action.type) {
		case getType(setPlayerTgoId):
			return {
				...state,
				playerTgoId: action.payload.playerTgoId,
			};
		case getType(createToken):
			return {
				...state,
				tokens: [
					...state.tokens,
					action.payload.token,
				]
			};
		case getType(deleteToken):
			return {
				...state,
				tokens: state.tokens.filter(token => token !== action.payload.token)
			};
		case getType(upgradeAccount):
			if (state.username !== '') {
				// Already upgraded.
				return state;
			}
			return {
				...state,
				username: action.payload.username,
				clientAndServerSaltedPassword: action.payload.clientAndServerSaltedPassword,
			};
		case getType(changePassword):
			if (state.clientAndServerSaltedPassword !== action.payload.clientAndServerSaltedOldPassword) {
				return state;
			}
			return {
				...state,
				clientAndServerSaltedPassword: action.payload.clientAndServerSaltedPassword,
			};
		default:
			return state;
	}
};

// accountList reducer:

export type AccountsState = {
	readonly [extraProps: string]: AccountType;
};

const initialState: AccountsState = {};
const listActions = [
	accountsActions.add,
	accountsActions.remove,
].map(a => getType(a));

type AccountsAction = ActionType<typeof accountsActions>;

export const accountListReducer = (state: AccountsState = initialState, action: AccountAction | AccountsAction) => {
	switch (action.type) {
		case getType(accountsActions.setAll):
			return action.payload.accounts;
		case getType(accountsActions.add):
			return {
				...state,
				[action.payload.account.accountId]: action.payload.account,
			};
		case getType(accountsActions.remove): {
			const { [action.payload.accountId]: undefined, ...rest } = state;
			return rest;
		}
		default:
			if (Object.values(accountActions).some(a => getType(a) === action.type)) {
				const accountAction = action as AccountAction;
				const newAccount = accountReducer(state[accountAction.payload.accountId], accountAction);
				if (newAccount !== state[accountAction.payload.accountId]) {
					return {
						...state,
						[accountAction.payload.accountId]: newAccount,
					};
				}
				return state;
			}
			return state;
	}
};
