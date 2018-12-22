import React, { useState, useRef } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import * as accountCommActions from '../actions/accountComm';
import * as netActions from '../actions/net';
import { RootStateType } from '../reducers';
import { AccountType } from '../reducers/account';

const AccountInfo = ({ account, onTokenSubmit }: ReturnType<typeof mapStoreToProps> & ReturnType<typeof mapDispatchToProps>) => {
	const [ accountFieldsVisible, setAccountFieldsVisible ] = useState(false);

	if (!account) {
		return (
			<div>
				<form onSubmit={onTokenSubmit}>
					<label htmlFor={'accountToken'}>Token: </label>
					<input id={'accountToken'} name={'token'} /><br />
					<button
						type={'submit'}
						onClick={() => setAccountFieldsVisible(false)}
					>
						Login with token
					</button>
				</form>
				{accountFieldsVisible
					? (<form>
						<label htmlFor={'accountLoginUsername'}>Username: </label>
						<input id={'accountLoginUsername'} /><br />
						<label htmlFor={'accountLoginPassword'}>Password: </label>
						<input id={'accountLoginPassword'} /><br />
						<button>Log in</button>
						<button onClick={() => setAccountFieldsVisible(false)}>Cancel</button>
					</form>)
					: <button onClick={() => setAccountFieldsVisible(true)}>Sign in</button>
				}
			</div>
		);
	}

	return (
		<div>
			<h3>Account information</h3>
			{account.username
				? (<button>Log out</button>)
				: (
					accountFieldsVisible
						? <form>
							<label htmlFor={'accountCreationUsername'}>Username: </label>
							<input id={'accountCreationUsername'} /><br />
							<label htmlFor={'accountCreationPassword'}>Password: </label>
							<input id={'accountCreationPassword'} /><br />
							<button>Create account</button>
							<button onClick={() => setAccountFieldsVisible(false)}>Cancel</button>
						</form>
						: <button onClick={() => setAccountFieldsVisible(true)}>Create an account</button>
				)
			}
		</div>
	);
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
	onTokenSubmit: (event: React.FormEvent<HTMLFormElement>) => {
		event.stopPropagation();
		event.preventDefault();
		const data = new FormData(event.currentTarget);
		const token = data.get('token');
		if (typeof token === 'string') {
			dispatch(netActions.send(accountCommActions.loginWithToken({ token })));
		}
	},
});

const mapStoreToProps = (store: RootStateType) => ({
	account: store.defaults.accountId ? store.accounts[store.defaults.accountId] : undefined,
});

export default connect(mapStoreToProps, mapDispatchToProps)(AccountInfo);
