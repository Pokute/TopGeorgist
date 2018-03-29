import React from 'react';
import { connect } from 'react-redux';

import * as netActions from '../actions/net';
import ParamInput, { packParam } from './paramInput.mjs';

const Action = props => (
	<form
		onSubmit={props.onSubmit(props.action)}
	>
		{(props.action.parameters || [])
			.map(p => <ParamInput key={p.name} parameter={p} />)
		}
		<button
			type={'submit'}
		>
			{props.action.label}
		</button>
	</form>
);

const mapDispatchToProps = (dispatch, passedProps) => ({
	onSubmit: action => ((event) => {
		event.preventDefault();
		const formData = new FormData(event.target);
		dispatch(netActions.send({
			...action.onClick,
			...passedProps.additionalSentData,
			...(passedProps.action.parameters || [])
				.map(parameter => packParam(parameter, formData))
				.reduce((combined, paramData) => ({ ...combined, ...paramData }), {}),
		}));
	}),
});

export default connect(undefined, mapDispatchToProps)(Action);
