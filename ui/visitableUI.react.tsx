import React from 'react';
import { connect } from 'react-redux';

import * as netActions from '../actions/net';
import VisitableGovernmentBuilding from './visitable/governmentBuilding';
import VisitableRentOffice from './visitable/rentOffice';
import Action from './action';
import { TgoType } from '../reducers/tgo';
import { RootStateType } from '../reducers';
import { Dispatch } from 'redux';

export interface Type {
	visitable: TgoType,
	visitor?: TgoType,
};

const VisitableUI = (props: Type & ReturnType<typeof mapStoreToProps>) => (
	<div>
		<p>{props.visitable.label}</p>
		{/* (props.visitable.visitable.actions || [])
			.map(va => (
				<Action
					key={va.label}
					action={va}
					additionalSentData={{
						tgoId: props.visitor.tgoId,
						visitableTgoId: props.visitable.tgoId,
					}}
				/>
			)) */
		}
		{props.visitable.leaderBoard && props.leaderBoard
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

const mapStoreToProps = (state: RootStateType, passedProps: Type) => {
	const getMoney = (tgo: TgoType) => {
		if (!tgo.inventory) return 0;
		const moneyItem = tgo.inventory.find(it => it.typeId === 'money');
		return moneyItem ? moneyItem.count : 0;
	};

	return ({
		leaderBoard: passedProps.visitable.leaderBoard
			? Object.values(state.tgos)
				.filter(tgo => tgo.typeId === 'player')
				.map(tgo => ({
					label: tgo.label,
					money: getMoney(tgo),
				}))
				.sort((pa, pb) => pb.money - pa.money)
			: undefined,
	});
};

const mapDispatchToProps = (dispatch: Dispatch, passedProps: Type) => ({
/* 	onActionClick: action => {
		if (!passedProps.visitor) return undefined;
		(() => dispatch(netActions.send({
			...action.onClick,
			tgoId: (passedProps.visitor as TgoType).tgoId,
			visitableTgoId: passedProps.visitable.tgoId,
		})))
	},
 */});

export default connect(mapStoreToProps, mapDispatchToProps)(VisitableUI);