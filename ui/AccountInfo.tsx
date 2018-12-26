import React, { useState, useRef, useEffect } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import * as accountCommActions from '../actions/accountComm';
import Category from './Category';
import * as netActions from '../actions/net';
import { RootStateType } from '../reducers';
import { Token } from '../reducers/account';

const AccountInfo = ({ account, onCreateAccountSubmit, onLoginSubmit, loginWithToken }: ReturnType<typeof mapStoreToProps> & ReturnType<typeof mapDispatchToProps>) => {
	useEffect(() => {
		const accountToken = window.localStorage.getItem('AccountToken');
		if (accountToken) {
			loginWithToken(accountToken);
		}
	}, []);
	const [ accountFieldsVisible, setAccountFieldsVisible ] = useState(false);
	const token = window.localStorage.getItem('AccountToken');
	const clearToken = () => {
		window.localStorage.removeItem('AccountToken');
		window.location.reload(true);
	};

	let innerContent;

	if (!account) {
		innerContent = (
			<div>
				{accountFieldsVisible
					? (<form onSubmit={onLoginSubmit}>
						<label htmlFor={'accountLoginUsername'}>Username: </label>
						<input id={'accountLoginUsername'} name={'username'} /><br />
						<label htmlFor={'accountLoginPassword'}>Password: </label>
						<input id={'accountLoginPassword'} type={'password'} name={'password'} /><br />
						<button>Log in</button>
						<button onClick={() => setAccountFieldsVisible(false)}>Cancel</button>
					</form>)
					: <button onClick={() => setAccountFieldsVisible(true)}>Sign in</button>
				}
			</div>
		);
	} else {
		innerContent = (
			<div>
				<button onClick={clearToken}>Clear token</button>
				{account.username
					? (<div>
						Username: {account.username}<br />
						<button disabled>Change password</button>
					</div>
					)
					: (<div>
						Temporary account.<br />
						{accountFieldsVisible && (token !== null)
							? <form onSubmit={onCreateAccountSubmit}>
								<label htmlFor={'accountCreationUsername'}>Username: </label>
								<input id={'accountCreationUsername'} name={'username'} /><br />
								<label htmlFor={'accountCreationPassword'}>Password: </label>
								<input id={'accountCreationPassword'} type={'password'} name={'password'} /><br />
								<input type={'hidden'} name={'token'} value={token} />
								<button>Create account</button>
								<button onClick={() => setAccountFieldsVisible(false)}>Cancel</button>
							</form>
							: <button onClick={() => setAccountFieldsVisible(true)}>Create an account</button>
						}
						</div>
					)
				}
			</div>
		);
	}

	return (
		<Category
			title={'Account'}
		>
			{innerContent}
		</Category>
	);
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
	onCreateAccountSubmit: (event: React.FormEvent<HTMLFormElement>) => {
		event.stopPropagation();
		event.preventDefault();
		const data = new FormData(event.currentTarget);
		const username = data.get('username');
		const password = data.get('password');
		const token = data.get('token');
		if (username && password && token && (typeof username === 'string') && (typeof password === 'string') && (typeof token === 'string')) {
			dispatch(netActions.send(accountCommActions.createAccountWithTokenClientSalted({ username, password, token })));
		}
	},
	onLoginSubmit: (event: React.FormEvent<HTMLFormElement>) => {
		event.stopPropagation();
		event.preventDefault();
		const data = new FormData(event.currentTarget);
		const username = data.get('username');
		const password = data.get('password');
		if (username && password && (typeof username === 'string') && (typeof password === 'string')) {
			dispatch(netActions.send(accountCommActions.loginClientSalted({ username, password })));
		}
	},
	loginWithToken: (token: Token) => {
		dispatch(netActions.send(accountCommActions.loginWithToken({ token })));
	},
});

const mapStoreToProps = (store: RootStateType) => ({
	account: store.defaults.accountId ? store.accounts[store.defaults.accountId] : undefined,
});

export default connect(mapStoreToProps, mapDispatchToProps)(AccountInfo);
