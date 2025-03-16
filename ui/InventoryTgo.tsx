import React from 'react';
import { useSelector } from 'react-redux';

import { type InventoryItem } from '../concerns/inventory.ts';
import { isComponentWork } from '../concerns/work.ts';
import { isComponentGoal } from '../concerns/goal.ts';
import { type RootStateType } from '../reducers/index.ts';
import Goal from './Goal.tsx';
import Work from './Work.tsx';
import { type TgoId } from '../reducers/tgo.ts';

const InventoryTgo = ({ i, parentTgoId }: { i: InventoryItem, parentTgoId?: TgoId }) => {
	if (i.typeId !== 'tgoId' || !i.tgoId) {
		return (<span>No tgoId!</span>);
	}

	const tgo = useSelector((store: RootStateType) => store.tgos[i.tgoId!]);
	if (!tgo) {
		return (<span>{`Tgo not found for id ${i.tgoId}`}</span>);
	}

	const tgoData = `TgoId: ${i.tgoId}.${i.count !== undefined && `Count: ${i.count}.`}`;

	if (isComponentGoal(tgo)) {
		return (<Goal
				tgo={tgo}
				goalDoerTgoId={parentTgoId}
				tgoData={tgoData}
			/>)
	}
	if (isComponentWork(tgo)) {
		return (<Work
				tgo={tgo}
				workDoerTgoId={parentTgoId}
				tgoData={tgoData}
			/>)
	}
	return (
		<span>{tgoData}</span>
	);
};

export default InventoryTgo;
