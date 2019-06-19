import React from 'react';
import { useSelector } from 'react-redux';

import { InventoryItem } from '../components/inventory';
import { isComponentGoal } from '../data/components_new';
import { RootStateType } from '../reducers';

const InventoryTgo = ({ i }: { i: InventoryItem }) => {
	if (i.typeId !== 'tgoId' || !i.tgoId) {
		return (<span>No tgoId!</span>);
	}

	const tgo = useSelector((store: RootStateType) => store.tgos[i.tgoId!]);
	if (!tgo) {
		return (<span>Tgo not found for id ${i.tgoId}</span>);
	}
	if (isComponentGoal(tgo)) {
		return (
			<span>{`TgoId: ${i.tgoId}. ${i.count}. Goal: ${tgo.goal.title}, req: ${tgo.goal.requirements} wis: ${tgo.goal.workInstances}`}</span>
		);
	}
	return (
		<span>{`TgoId: ${i.tgoId}. ${i.count}`}</span>
	);
};

export default InventoryTgo;
