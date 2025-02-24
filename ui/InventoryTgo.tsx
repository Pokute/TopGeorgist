import React from 'react';
import { useSelector } from 'react-redux';

import { InventoryItem } from '../concerns/inventory.js';
import { isComponentWork } from '../concerns/work.js';
import { isComponentGoal } from '../concerns/goal.js';
import { RootStateType } from '../reducers/index.js';
import Goal from './Goal.js';
import Work from './Work.js';
import { TgoId } from '../reducers/tgo.js';

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
