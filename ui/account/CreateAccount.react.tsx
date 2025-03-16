import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

import * as netActions from '../../concerns/infra/net.ts';
import { createAccountWithTokenClientSalted } from '../../concerns/account.ts';

export default () => {
	const dispatch = useDispatch();
	const [ accountFieldsVisible, setAccountFieldsVisible ] = useState(false);
	const token = window.localStorage.getItem('AccountToken');
	if (!token) { // Token is valid for account / temporary account.
		return null;
	}
	const onCreateAccountSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.stopPropagation();
		event.preventDefault();
		const data = new FormData(event.currentTarget);
		const username = data.get('username');
		const password = data.get('password');
		const token = data.get('token');
		if (username && password && token && (typeof username === 'string') && (typeof password === 'string') && (typeof token === 'string')) {
			dispatch(netActions.send(createAccountWithTokenClientSalted({ username, password, token })));
		}
	};
	if (accountFieldsVisible) {
		return (
			<form onSubmit={onCreateAccountSubmit}>
				<label htmlFor={'accountCreationUsername'}>Username: </label>
				<input id={'accountCreationUsername'} name={'username'} autoComplete="username" /><br />
				<label htmlFor={'accountCreationPassword'}>Password: </label>
				<input id={'accountCreationPassword'} type={'password'} name={'password'} autoComplete="new-password" /><br />
				<input type={'hidden'} name={'token'} value={token} />
				<button type="submit">Create account</button>
				<button type="reset" onClick={() => setAccountFieldsVisible(false)}>Cancel</button>
			</form>
		);
	} else {
		return (
			<button type="button" onClick={() => setAccountFieldsVisible(true)}>Create an account</button>
		);
	}
};
