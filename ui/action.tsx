import React from 'react';
import { connect } from 'react-redux';
import { type Dispatch } from 'redux';

import * as netActions from '../concerns/infra/net.ts';
import ParamInput, { packParam } from './paramInput.tsx';
import { type Action } from '../data/components_new.ts';

export interface Type {
	readonly action: Action,
	readonly additionalSentData: any,
};

const Action = ({ onSubmit, action }: Type & ReturnType<typeof mapDispatchToProps>) => (
	<form
		onSubmit={onSubmit}
	>
		{(action.parameters ?? [])
			.map(p => <ParamInput key={p.name} parameter={p} />)
		}
		<button
			type={'submit'}
		>
			{action.label}
		</button>
	</form>
);

const mapDispatchToProps = (dispatch: Dispatch, { action, additionalSentData }: Type) => ({
	onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();
			const formData = new FormData(event.currentTarget);
			const { type, ...onClickActionParams } = action.onClick;
			dispatch(netActions.send({
				type,
				payload: {
					...onClickActionParams,
					...additionalSentData,
					...(action.parameters || [])
						.map(parameter => packParam(parameter, formData))
						.reduce((combined, paramData) => ({ ...combined, ...paramData }), {}),
				}
			}));
		},
});

export default connect(undefined, mapDispatchToProps)(Action);
