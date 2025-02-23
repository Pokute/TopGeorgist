import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { ComponentInventory } from '../concerns/inventory.js';
import { ComponentWork, ComponentWorkDoer, workActions } from '../concerns/work.js';
import { RootStateType } from '../reducers/index.js';
import { TgoId, TgoType } from '../reducers/tgo.js';
import Category from './Category.js';
import { RecipeId } from './Recipe.js';
import * as netActions from '../concerns/infra/net.js';

const Work = ({ tgo, workDoerTgoId, tgoData }: { tgo: ComponentWork, workDoerTgoId?: TgoId, tgoData?: string }) /*({ workTgoId }: { workTgoId: TgoId })*/ => {
	const inputCommittedInventoryTgos = useSelector(
		(store: RootStateType) =>
			Object.entries(tgo.workInputCommittedItemsTgoId ?? {})
				.filter(([committerTgoId, committedInventoryTgoId]) => committedInventoryTgoId)
				.map<[TgoId, TgoType]>(([committerTgoId, committedInventoryTgoId]) => [committerTgoId as TgoId, store.tgos[committedInventoryTgoId!] as ComponentInventory])
	);
	const outputInventoryTgo = useSelector((store: RootStateType) => tgo.workOutputInventoryTgoId ? store.tgos[tgo.workOutputInventoryTgoId] : undefined)
	const dispatch = useDispatch();
//	const wiTgo = useSelector((store: RootStateType) => store.tgos[workTgoId]);
	// if (isComponentWork(wiTgo)) {
		return (
			<Category
				title={`Work ${tgo.tgoId}`}
			>
				{workDoerTgoId && <>
					<button
						onClick={() => dispatch(netActions.send(workActions.cancelWork(workDoerTgoId, tgo.tgoId)))}
					>
						Cancel
					</button>
					{tgo.workPaused
						? <button
							onClick={() => dispatch(netActions.send(workActions.resumeWork(workDoerTgoId, tgo.tgoId)))}
						>
							Resume
						</button>
						: <button
							onClick={() => dispatch(netActions.send(workActions.pauseWork(workDoerTgoId, tgo.tgoId)))}
						>
							Pause
						</button>
					}
				</>}
				<RecipeId recipeId={tgo.workRecipe.type} />
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
