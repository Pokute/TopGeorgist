import React from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';

import * as netActions from '../actions/net.js';
import VisitableGovernmentBuilding from './visitable/governmentBuilding.js';
import VisitableRentOffice from './visitable/rentOffice.js';
import { TgoType } from '../reducers/tgo.js';
import { RootStateType } from '../reducers/index.js';
import { Dispatch } from 'redux';
import ActionUI from './action.js';
import { Action, hasComponentLeaderBoard, hasComponentRentOffice, hasComponentGovernmentBuilding, ComponentVisitable } from '../data/components_new.js';
import { hasComponentInventory } from '../concerns/inventory.js';
import { hasComponentPlayer } from '../components/player.js';
import { ComponentLabel, hasComponentLabel } from '../components/label.js';
import { ComponentPosition } from '../components/position.js';

export interface Type {
	readonly visitable: ComponentLabel & ComponentVisitable,
	readonly visitor: ComponentPosition,
};

const LeaderBoard = () => {
	const s = useSelector<RootStateType, RootStateType>(s => s);

	const getMoney = (tgo: TgoType) => {
		if (!hasComponentInventory(tgo)) return 0;
		const moneyItem = tgo.inventory.find(it => it.typeId === 'money');
		return moneyItem ? moneyItem.count : 0;
	};

	const leaderBoard = Object.values(s.tgos)
		.filter(hasComponentPlayer)
		.filter(hasComponentLabel)
		.map(tgo => ({
			label: tgo.label,
			money: getMoney(tgo),
		}))
		.sort((pa, pb) => pb.money - pa.money)

	return (
		<ol>
			{leaderBoard.map(p => (
				<li key={p.label}>{`${p.label}: ${p.money}`}</li>
			))}
		</ol>
	)
}

export default ({ visitable, visitor }: Type) => {
	return (
		<div>
			<p>{visitable.label}</p>
			{(visitable.visitable.actions ?? [])
				.map(va => (
					<ActionUI
						key={va.label}
						action={va}
						additionalSentData={{
							tgoId: visitor!.tgoId,
							visitableTgoId: visitable.tgoId,
						}}
					/>
				))
			}
			{hasComponentLeaderBoard(visitable)
				? <LeaderBoard />
				: null
			}
			{hasComponentGovernmentBuilding(visitable)
				? <VisitableGovernmentBuilding />
				: null
			}
			{hasComponentRentOffice(visitable)
				? <VisitableRentOffice />
				: null
			}
		</div>
	);
};
