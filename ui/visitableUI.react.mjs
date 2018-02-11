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
		{props.visitable.leaderBoard
			? <ol>
				{props.leaderBoard.map(p => (
					<li key={p.label}>{`${p.label}: ${p.money}`}</li>
				))}
			</ol>
			: null
		}
	</div>
);

const mapStoreToProps = (state, passedProps) => ({
	leaderBoard: passedProps.visitable.leaderBoard
		? state.tgos
			.filter(tgo => tgo.typeId === 'player')
			.map(tgo => ({ label: tgo.label, money: tgo.inventory.find(it => it.typeId === 'money').count }))
			.sort((pa, pb) => pb.money - pa.money)
		: undefined,
});

const mapDispatchToProps = (dispatch, passedProps) => ({
	onActionClick: action => (() => dispatch(netActions.send({
		...action.onClick,
		tgoId: passedProps.visitor.tgoId,
		visitableTgoId: passedProps.visitable.tgoId,
	}))),
});

export default connect(mapStoreToProps, mapDispatchToProps)(VisitableUI);
