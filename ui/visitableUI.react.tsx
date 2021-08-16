import React from 'react';
import { connect } from 'react-redux';

import * as netActions from '../actions/net.js';
import VisitableGovernmentBuilding from './visitable/governmentBuilding.js';
import VisitableRentOffice from './visitable/rentOffice.js';
import { TgoType } from '../reducers/tgo.js';
import { RootStateType } from '../reducers/index.js';
import { Dispatch } from 'redux';
import { Action } from '../data/components.js';
import ActionUI from './action.js';
import { hasComponentLeaderBoard, hasComponentRentOffice, hasComponentGovernmentBuilding, ComponentVisitable } from '../data/components_new.js';
import { hasComponentInventory } from '../concerns/inventory.js';
import { hasComponentPlayer } from '../components/player.js';
import { ComponentLabel, hasComponentLabel } from '../components/label.js';

export interface Type {
	readonly visitable: TgoType & ComponentLabel & ComponentVisitable,
	readonly visitor?: TgoType,
};

const VisitableUI = (props: Type & ReturnType<typeof mapStoreToProps>) => (
	<div>
		<p>{props.visitable.label}</p>
		{props.visitable.visitable
			? ((props.visitable.visitable.actions || []) as ReadonlyArray<Action>)
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
