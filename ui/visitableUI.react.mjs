import React from 'react';
import { connect } from 'react-redux';

import * as netActions from '../actions/net';
import VisitableGovernmentBuilding from './visitable/governmentBuilding';
import VisitableRentOffice from './visitable/rentOffice';
import Action from './action.mjs';

const VisitableUI = props => (
	<div>
		<p>{props.visitable.label}</p>
		{(props.visitable.visitable.actions || [])
			.map(va => (
				<Action
					key={va.label}
					action={va}
					additionalSentData={{
						tgoId: props.visitor.tgoId,
						visitableTgoId: props.visitable.tgoId,
					}}
				/>
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
		{props.visitable.governmentBuilding 
			? <VisitableGovernmentBuilding />
			: null
		}
		{props.visitable.rentOffice 
			? <VisitableRentOffice />
			: null
		}
	</div>
);

const mapStoreToProps = (state, passedProps) => ({
	leaderBoard: passedProps.visitable.leaderBoard
		? Object.values(state.tgos)
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
