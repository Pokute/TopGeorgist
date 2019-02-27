import React from 'react';
import { connect } from 'react-redux';

import * as netActions from '../actions/net';
import VisitableGovernmentBuilding from './visitable/governmentBuilding';
import VisitableRentOffice from './visitable/rentOffice';
import { TgoType } from '../reducers/tgo';
import { RootStateType } from '../reducers';
import { Dispatch } from 'redux';
import { Action } from '../components';
import ActionUI from './action';
import { hasComponentLeaderBoard, hasComponentRentOffice, hasComponentGovernmentBuilding, hasComponentPlayer, ComponentVisitable, ComponentLabel, hasComponentLabel, hasComponentInventory } from '../components_new';

export interface Type {
	visitable: TgoType & ComponentLabel & ComponentVisitable,
	visitor?: TgoType,
};

const VisitableUI = (props: Type & ReturnType<typeof mapStoreToProps>) => (
	<div>
		<p>{props.visitable.label}</p>
		{props.visitable.visitable
			? ((props.visitable.visitable.actions || []) as Action[])
			.map(va => (
				<ActionUI
					key={va.label}
					action={va}
					additionalSentData={{
						tgoId: props.visitor!.tgoId,
						visitableTgoId: props.visitable.tgoId,
					}}
				/>
			))
			: undefined
		}
		{(hasComponentLeaderBoard(props.visitable) && props.leaderBoard)
			? <ol>
				{props.leaderBoard.map(p => (
					<li key={p.label}>{`${p.label}: ${p.money}`}</li>
				))}
			</ol>
			: null
		}
		{hasComponentGovernmentBuilding(props.visitable)
			? <VisitableGovernmentBuilding />
			: null
		}
		{hasComponentRentOffice(props.visitable)
			? <VisitableRentOffice />
			: null
		}
	</div>
);

const mapStoreToProps = (state: RootStateType, passedProps: Type) => {
	const getMoney = (tgo: TgoType) => {
		if (!hasComponentInventory(tgo)) return 0;
		const moneyItem = tgo.inventory.find(it => it.typeId === 'money');
		return moneyItem ? moneyItem.count : 0;
	};

	return ({
		leaderBoard: hasComponentLeaderBoard(passedProps.visitable)
			? Object.values(state.tgos)
				.filter(hasComponentPlayer)
				.filter(hasComponentLabel)
				.map(tgo => ({
					label: tgo.label,
					money: getMoney(tgo),
				}))
				.sort((pa, pb) => pb.money - pa.money)
			: undefined,
	});
};

const mapDispatchToProps = (dispatch: Dispatch, passedProps: Type) => ({
	onActionClick: (action: Action) => {
		if (!passedProps.visitor) return undefined;
		(() => dispatch(netActions.send({
			...action.onClick,
			tgoId: (passedProps.visitor as TgoType).tgoId,
			visitableTgoId: passedProps.visitable.tgoId,
		})))
	},
});

export default connect(mapStoreToProps, mapDispatchToProps)(VisitableUI);
