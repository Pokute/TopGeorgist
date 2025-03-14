import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

import { loginClientSalted } from '../../concerns/account.js';
import * as netActions from '../../concerns/infra/net.js';

export default () => {
	const dispatch = useDispatch();
	const onLoginSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.stopPropagation();
		event.preventDefault();
		const data = new FormData(event.currentTarget);
		const username = data.get('username');
		const password = data.get('password');
		if (username && password && (typeof username === 'string') && (typeof password === 'string')) {
			dispatch(netActions.send(loginClientSalted({ username, password })));
		}
	};
	const [ accountFieldsVisible, setAccountFieldsVisible ] = useState(false);
	return (
		<div>
			{accountFieldsVisible
				? (<form onSubmit={onLoginSubmit}>
					<label htmlFor={'accountLoginUsername'}>Username: </label>
					<input id={'accountLoginUsername'} name={'username'} autoComplete='username' /><br />
					<label htmlFor={'accountLoginPassword'}>Password: </label>
					<input id={'accountLoginPassword'} type={'password'} name={'password'} autoComplete='current-password' /><br />
					<button type="submit">Log in</button>
					<button type="reset" onClick={() => setAccountFieldsVisible(false)}>Cancel</button>
				</form>)
				: <button type="button" onClick={() => setAccountFieldsVisible(true)}>Sign in</button>
		}
		</div>
	);
};
