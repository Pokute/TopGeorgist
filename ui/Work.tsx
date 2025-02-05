import React from 'react';
import { useSelector } from 'react-redux';

import { ComponentInventory } from '../concerns/inventory.js';
import { ComponentWork } from '../concerns/work.js';
import { RootStateType } from '../reducers/index.js';
import { TgoId, TgoType } from '../reducers/tgo.js';
import Category from './Category.js';

const Work = ({ tgo, tgoData }: { tgo: ComponentWork, tgoData?: string }) /*({ workTgoId }: { workTgoId: TgoId })*/ => {
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
					<ul>
					{inputCommittedInventoryTgos.map(([committerTgoId, committedInventoryTgo]) =>
						committedInventoryTgo.inventory && (<li key={committerTgoId}>
							<span>{`source: ${committerTgoId}`}</span>
							<ul>
								{committedInventoryTgo.inventory.map(ii => (
									<li key={ii.tgoId || ii.typeId}>{`${ii.typeId}: ${ii.count}`}</li>
								))}
							</ul>
						</li>)
					)}
					</ul>
				</div>
				<div>
					<span>outputTgoId: {outputInventoryTgo?.tgoId} Inventory:</span>
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

export default Work;
