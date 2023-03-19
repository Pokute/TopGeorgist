import React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import * as netActions from '../actions/net.js';
import ParamInput, { packParam } from './paramInput.js';
import { Action } from '../data/components_new.js';

export interface Type {
	readonly action: Action,
	readonly additionalSentData: any,
	onSubmit?(action: Type['action']): (event: React.FormEvent<HTMLFormElement>) => void,
}

const Action = (props: Type & ReturnType<typeof mapDispatchToProps>) => (
	<form
		onSubmit={props.onSubmit!(props.action)}
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

const mapDispatchToProps = (dispatch: Dispatch, passedProps: Type) => ({
	onSubmit: (action: Type['action']) => ((event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		const { type, ...onClickActionParams } = action.onClick;
		dispatch(netActions.send({
			type,
			payload: {
				...onClickActionParams,
				...passedProps.additionalSentData,
				...(passedProps.action.parameters || [])
					.map(parameter => packParam(parameter, formData))
					.reduce((combined, paramData) => ({ ...combined, ...paramData }), {}),
			}
		}));
	}),
});

export default connect(undefined, mapDispatchToProps)(Action);
