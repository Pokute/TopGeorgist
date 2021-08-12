import React from 'react';
import { useSelector } from 'react-redux';

import { InventoryItem, hasComponentInventory } from '../components/inventory.js';
import { isComponentWork } from '../concerns/work.js';
import { ComponentGoal, isComponentGoal } from '../concerns/goal.js';
import { RootStateType } from '../reducers/index.js';
import InventoryReact from './inventory.react.js';
import { TgoId } from '../reducers/tgo.js';
import Category from './Category.js';

const RenderWork = ({ workTgoId }: { workTgoId: TgoId }) => {
	const wiTgo = useSelector((store: RootStateType) => store.tgos[workTgoId]);
	if (isComponentWork(wiTgo)) {
		return (
			<div>
				<div>Recipe: {wiTgo.workRecipe.type}</div>
				<div>Target: {wiTgo.workOutputInventoryTgoId}</div>
				<div>
					ActorCommitted:
					{/* <InventoryReact
						ownerTgoId={wiTgo.workInputCommittedItemsTgoId}
					/> */}
				</div>
				<div>
					TargetCommitted:
					{/* <InventoryReact
						ownerTgoId={wiTgo.workTargetCommittedItemsTgoId}
					/> */}
				</div>
				<div>
					workTarget:
					<InventoryReact
						ownerTgoId={wiTgo.workOutputInventoryTgoId}
					/>
				</div>
			</div>
		);
	} else {
		return (<span>
			NoWorkInv!
		</span>)
	}
};

const RenderGoal = ({ tgo, tgoData }: { tgo: ComponentGoal, tgoData: string }) => (
	<Category
		title={`Goal: ${tgo.goal.title}`}
	>
		<span>{`${tgoData}`}</span>
		{tgo.goal.requirements.map(req => {
			switch(req.type) {
				// case 'RequirementMove': {
				// 	return (<span key={req.type}>
				// 		{`Req move to: ${req.targetPosition.x}, ${req.targetPosition.y}`}
				// 	</span>);
				// }
				default:
					return (<span key={req.type}>
						{`unknown type`}
					</span>);
			}
		})}
		{/* {tgo.goal.workTgoIds.map(wiTgoId => (
			<RenderWork
				key={wiTgoId}
				workTgoId={wiTgoId}
			/>	
		))} */}
	</Category>
);

const InventoryTgo = ({ i }: { i: InventoryItem }) => {
	if (i.typeId !== 'tgoId' || !i.tgoId) {
		return (<span>No tgoId!</span>);
	}

	const tgo = useSelector((store: RootStateType) => store.tgos[i.tgoId!]);
	if (!tgo) {
		return (<span>{`Tgo not found for id ${i.tgoId}`}</span>);
	}

	const tgoData = `TgoId: ${i.tgoId}. Count: ${i.count}.`;

	if (isComponentGoal(tgo)) {
		return (<RenderGoal
				tgo={tgo}
				tgoData={tgoData}
			/>)
	}
	return (
		<span>${tgoData}</span>
	);
};

export default InventoryTgo;
