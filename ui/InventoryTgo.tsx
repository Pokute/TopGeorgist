import React from 'react';
import { useSelector } from 'react-redux';

import { InventoryItem, hasComponentInventory, ComponentInventory } from '../concerns/inventory.js';
import { ComponentWork, isComponentWork } from '../concerns/work.js';
import { ComponentGoal, isComponentGoal } from '../concerns/goal.js';
import { RootStateType } from '../reducers/index.js';
import { TgoId, TgoType } from '../reducers/tgo.js';
import Category from './Category.js';
import MapPosition from './MapPosition.js';

const RenderWork = ({ tgo, tgoData }: { tgo: ComponentWork, tgoData?: string }) /*({ workTgoId }: { workTgoId: TgoId })*/ => {
	const inputCommittedInventoryTgos = useSelector(
		(store: RootStateType) =>
			Object.entries(tgo.workInputCommittedItemsTgoId ?? {})
				.map<[TgoId, TgoType]>(([committerTgoId, committedInventoryTgoId]) => [committerTgoId as TgoId, store.tgos[committedInventoryTgoId] as ComponentInventory])
	);
	const outputInventoryTgo = useSelector((store: RootStateType) => tgo.workOutputInventoryTgoId ? store.tgos[tgo.workOutputInventoryTgoId] : undefined)
//	const wiTgo = useSelector((store: RootStateType) => store.tgos[workTgoId]);
	// if (isComponentWork(wiTgo)) {
		return (
			<Category
				title='Work'
			>
				<div>Recipe: {tgo.workRecipe.type}</div>
				<div>Target: {tgo.workOutputInventoryTgoId}</div>
				<div>
					InputsCommited:
					{inputCommittedInventoryTgos.map(([committerTgoId, committedInventoryTgo]) =>
						committedInventoryTgo.inventory && (<div key={committerTgoId}>
							<span>{`source: ${committerTgoId}`}</span>
							<ul>
								{committedInventoryTgo.inventory.map(ii => (
									<li key={ii.tgoId || ii.typeId}>{`${ii.typeId}: ${ii.count}`}</li>
								))}
							</ul>
						</div>)
					)}
				</div>
				<div>
					<span>outputTgoId: ${outputInventoryTgo?.tgoId} Inventory:</span>
					<ul>
						{outputInventoryTgo?.inventory && outputInventoryTgo.inventory.map(ii => (
							<li key={ii.tgoId || ii.typeId}>{`${ii.typeId}: ${ii.count}`}</li>
						))}
					</ul>
				</div>
			</Category>
		);
	// } else {
	// 	return (<span>
	// 		NoWorkInv!
	// 	</span>)
	// }
};

const RenderGoal = ({ tgo, tgoData }: { tgo: ComponentGoal, tgoData?: string }) => {
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
				<RenderWork
					key={wiTgo.tgoId}
					tgo={wiTgo}
				/>
			))}
		</Category>
	)
};

const InventoryTgo = ({ i }: { i: InventoryItem }) => {
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
				tgoData={tgoData}
			/>)
	}
	if (isComponentWork(tgo)) {
		return (<RenderWork
				tgo={tgo}
				tgoData={tgoData}
			/>)
	}
	return (
		<span>{tgoData}</span>
	);
};

export default InventoryTgo;
