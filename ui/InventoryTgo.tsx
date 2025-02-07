import React from 'react';
import { useSelector } from 'react-redux';

import { InventoryItem } from '../concerns/inventory.js';
import { isComponentWork } from '../concerns/work.js';
import { ComponentGoal, isComponentGoal } from '../concerns/goal.js';
import { RootStateType } from '../reducers/index.js';
import Category from './Category.js';
import MapPosition from './MapPosition.js';
import Work from './Work.js';
import { TgoId } from '../reducers/tgo.js';

const RenderGoal = ({ tgo, goalDoerTgoId, tgoData }: { tgo: ComponentGoal, goalDoerTgoId?: TgoId, tgoData?: string }) => {
	const workTgos = useSelector((store: RootStateType) => tgo.goal.workTgoIds.map(workTgoId => store.tgos[workTgoId]))
		.filter(isComponentWork);
	return (
		<Category
			title={`Goal: ${tgo.goal.title}`}
		>
			<span>{`${tgoData}`}</span>
			{tgo.goal.requirements.map(req => {
				switch(req.type) {
					case 'RequirementMove': {
						return (<span key={req.type}>
							{`Req move to: `}<MapPosition {...req.targetPosition} />
						</span>);
					}
					default:
						return (<span key={req.type}>
							{`unknown type`}
						</span>);
				}
			})}
			{workTgos.map(wiTgo => (
				<Work
					key={wiTgo.tgoId}
					workDoerTgoId={goalDoerTgoId}
					tgo={wiTgo}
				/>
			))}
		</Category>
	)
};

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
		return (<RenderGoal
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
