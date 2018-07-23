import React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import * as netActions from '../actions/net';
import ParamInput, { packParam, Parameter } from './paramInput';

export interface Type {
	action: {
		label: string,
		parameters: Parameter[],
		onClick: {
			type: string,
		}
	},
	additionalSentData: any,
	onSubmit(action: Type['action']): () => void,
}

const Action = (props: Type) => (
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

const mapDispatchToProps = (dispatch: Dispatch, passedProps: Type) => ({
	onSubmit: (action: Type['action']) => ((event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
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
