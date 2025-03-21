import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { type ComponentInventory } from '../concerns/inventory.ts';
import { type RootStateType } from '../reducers/index.ts';
import { type TgoId, type TgoType } from '../reducers/tgo.ts';
import Category from './Category.tsx';
import * as netActions from '../concerns/infra/net.ts';
import { type ComponentGoal, goalActionList } from '../concerns/goal.ts';
import MapPosition from './MapPosition.tsx';
import { isComponentWork } from '../concerns/work.ts';
import Work from './Work.tsx';
import { InventoryReactItems } from './inventory.react.tsx';

const Goal = ({ tgo, goalDoerTgoId, tgoData }: { tgo: ComponentGoal, goalDoerTgoId?: TgoId, tgoData?: string }) => {
	const workTgos = useSelector((store: RootStateType) => tgo.worksIssued.map(({ workTgoId }) => store.tgos[workTgoId]))
		.filter(isComponentWork);
	const inputCommittedInventoryTgos = useSelector(
		(store: RootStateType) =>
			Object.entries(tgo.workInputCommittedItemsTgoId ?? {})
				.filter(([committerTgoId, committedInventoryTgoId]) => committedInventoryTgoId)
				.map<[TgoId, TgoType]>(([committerTgoId, committedInventoryTgoId]) => [committerTgoId as TgoId, store.tgos[committedInventoryTgoId!] as ComponentInventory])
	);
	const dispatch = useDispatch();
//	const wiTgo = useSelector((store: RootStateType) => store.tgos[workTgoId]);
	// if (isComponentWork(wiTgo)) {
		return (
			<Category
				title={`Goal: ${tgo.goal.title} :${tgo.tgoId}`}
			>
				{goalDoerTgoId && <>
					<button
						onClick={() => dispatch(netActions.send(goalActionList.cancelGoal(goalDoerTgoId, tgo.tgoId)))}
					>
						Cancel
					</button>
					{tgo.goal.goalPaused
						? <button
							onClick={() => dispatch(netActions.send(goalActionList.resumeGoal(goalDoerTgoId, tgo.tgoId)))}
						>
							Resume
						</button>
						: <button
							onClick={() => dispatch(netActions.send(goalActionList.pauseGoal(goalDoerTgoId, tgo.tgoId)))}
						>
							Pause
						</button>
					}
				</>}
				{tgo.goal.requirements.map(req => {
					switch(req.type) {
						case 'RequirementMove': {
							return (<span key={req.type}>
								{`Req move to: `}<MapPosition {...req.targetPosition} />
							</span>);
						}
						case 'RequirementAcquireInventoryItems':
							return (
								<React.Fragment key={req.type}>
									Req for items:
									<InventoryReactItems inventory={req.inventoryItems} />
								</React.Fragment>
							);
						case 'RequirementKeepMinimumInventoryItems':
							return (
								<React.Fragment key={req.type}>
									Req for minimum items:
									<InventoryReactItems inventory={req.inventoryItems} />
									{req.completeOnMinimumReached ? <span>completeOnMinimumReached</span> : null}
								</React.Fragment>
							);
						default:
							return (<span key={(req as any).type}>
								{`unknown type ${(req as any).type}`}
							</span>);
					}
				})}
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
				{workTgos.map(wiTgo => (
					<Work
						key={wiTgo.tgoId}
						workDoerTgoId={goalDoerTgoId}
						tgo={wiTgo}
					/>
				))}
			</Category>
		);
	// } else {
	// 	return (<span>
	// 		NoWorkInv!
	// 	</span>)
	// }
};

export default Goal;
