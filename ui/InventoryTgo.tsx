import React from 'react';
import { useSelector } from 'react-redux';

import { InventoryItem, hasComponentInventory } from '../components/inventory';
import { isComponentGoal, isComponentWork, ComponentGoalDoer, ComponentGoal } from '../data/components_new';
import { RootStateType } from '../reducers';
import InventoryReact from './inventory.react';
import { TgoId } from '../reducers/tgo';
import Category from './Category';

const RenderWorkInstance = ({ workTgoId }: { workTgoId: TgoId }) => {
	const wiTgo = useSelector((store: RootStateType) => store.tgos[workTgoId]);
	if (isComponentWork(wiTgo)) {
		return (
			<div>
				<div>Type: {wiTgo.work.type}</div>
				<div>Target: {wiTgo.workTargetTgoId}</div>
				<div>
					ActorCommitted:
					<InventoryReact
						key={wiTgo.tgoId}
						ownerTgoId={wiTgo.workActorCommittedItemsTgoId}
					/>
				</div>
				<div>
					TargetCommitted:
					<InventoryReact
						key={wiTgo.tgoId}
						ownerTgoId={wiTgo.workTargetCommittedItemsTgoId}
					/>
				</div>
			</div>
		);
	} else {
		return (<span>
			NoWorkInstanceInv!
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
				case 'RequirementMove': {
					return (<span key={req.type}>
						{`Req move to: ${req.targetPosition.x}, ${req.targetPosition.y}`}
					</span>);
				}
				default:
					return (<span key={req.type}>
						{`unknown type`}
					</span>);
			}
		})}
		{tgo.goal.workInstances.map(wiTgoId => (
			<RenderWorkInstance
				key={wiTgoId}
				workTgoId={wiTgoId}
			/>	
		))}
	</div>
);

const InventoryTgo = ({ i }: { i: InventoryItem }) => {
	if (i.typeId !== 'tgoId' || !i.tgoId) {
		return (<span>No tgoId!</span>);
	}

	const tgo = useSelector((store: RootStateType) => store.tgos[i.tgoId!]);
	if (!tgo) {
		return (<span>Tgo not found for id ${i.tgoId}</span>);
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
