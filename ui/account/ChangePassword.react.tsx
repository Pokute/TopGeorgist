import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import * as netActions from '../../concerns/infra/net.js';
import { requestChangePasswordClientSalted } from "../../concerns/account.js";
import { RootStateType } from "../../reducers/index.js";

export default () => {
	const dispatch = useDispatch();
	const [ changeAccountPasswordVisible, setChangeAccountPasswordVisible ] = useState(false);
	const username = useSelector((s: RootStateType) => s.accounts[s.defaults.accountId]?.username);
	const token = window.localStorage.getItem('AccountToken');
	if (!token) { // Token is valid for account / temporary account.
		return null;
	}
	const onChangeAccountPasswordSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.stopPropagation();
		event.preventDefault();
		const data = new FormData(event.currentTarget);
		const username = data.get('username');
		const password = data.get('password');
		const oldPassword = data.get('oldPassword');
		if (username && password && oldPassword && (typeof username === 'string') && (typeof password === 'string') && (typeof oldPassword === 'string')) {
			dispatch(netActions.send(requestChangePasswordClientSalted({ username, password, oldPassword })));
		}
	};
	if (changeAccountPasswordVisible) {
		return (
			<form onSubmit={onChangeAccountPasswordSubmit}>
				<input type={'hidden'} name={'username'} value={username} /><br />
				<label htmlFor={'accountChangePasswordOldPassword'}>Old password: </label>
				<input id={'accountChangePasswordOldPassword'} type={'password'} name={'oldPassword'} /><br />
				<label htmlFor={'accountChangePasswordNewPassword'}>New password: </label>
				<input id={'accountChangePasswordNewPassword'} type={'password'} name={'password'} /><br />
				<button>Change password</button>
				<button onClick={() => setChangeAccountPasswordVisible(false)}>Cancel</button>
			</form>
		);
	} else {
		return (
			<button onClick={() => setChangeAccountPasswordVisible(true)}>Change password?</button>
		);
	}
};
