import React, { useState } from "react";
import { useDispatch } from "react-redux";

import * as netActions from '../../concerns/infra/net.js';
import { createAccountWithTokenClientSalted } from "../../concerns/account.js";

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
				<input id={'accountCreationUsername'} name={'username'} /><br />
				<label htmlFor={'accountCreationPassword'}>Password: </label>
				<input id={'accountCreationPassword'} type={'password'} name={'password'} /><br />
				<input type={'hidden'} name={'token'} value={token} />
				<button>Create account</button>
				<button onClick={() => setAccountFieldsVisible(false)}>Cancel</button>
			</form>
		);
	} else {
		return (
			<button onClick={() => setAccountFieldsVisible(true)}>Create an account</button>
		);
	}
};
