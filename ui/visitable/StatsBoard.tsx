import React from 'react';
import { useSelector } from 'react-redux';

import { type TgoType } from '../../reducers/tgo.ts';
import { type RootStateType } from '../../reducers/index.ts';
import { hasComponentInventory } from '../../concerns/inventory.ts';
import { hasComponentPlayer } from '../../components/player.ts';
import { hasComponentLabel } from '../../components/label.ts';

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
};

export default () => {
	const s = useSelector<RootStateType, RootStateType>(s => s);
	const currentTick = s.ticker.currentTick;

	return (
		<div>
			Ticks elapsed: {currentTick}<br/>
			<LeaderBoard />
		</div>
	)
};
