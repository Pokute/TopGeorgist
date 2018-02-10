import React from 'react';
import { connect } from 'react-redux';

import * as netActions from '../actions/net';

const VisitableUI = props => (
	<div>
		<p>{props.visitable.label}</p>
		{(props.visitable.visitable.actions || [])
			.map(va => (
				<button
					key={va.label}
					onClick={props.onActionClick(va)}
				>
					{va.label}
				</button>
			))
		}
	</div>
);

const mapDispatchToProps = (dispatch, passedProps) => ({
	onActionClick: action => (() => dispatch(netActions.send({
		...action.onClick,
		tgoId: passedProps.visitor.tgoId,
		visitableTgoId: passedProps.visitable.tgoId,
	}))),
});

export default connect(undefined, mapDispatchToProps)(VisitableUI);
