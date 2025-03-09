import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { ComponentInventory } from '../concerns/inventory.js';
import { RootStateType } from '../reducers/index.js';
import { TgoId, TgoType } from '../reducers/tgo.js';
import Category from './Category.js';
import * as netActions from '../concerns/infra/net.js';
import { ComponentGoal, goalActionList } from '../concerns/goal.js';
import MapPosition from './MapPosition.js';
import { MapPosition as MapPositionType } from '../concerns/map.js';
import { isComponentWork } from '../concerns/work.js';
import Work from './Work.js';
import { InventoryReactItems } from './inventory.react.js';
import recipes from '../data/recipes.js';
import { TypeId } from '../reducers/itemType.js';
import { itemReqGoal } from '../concerns/itemReqGoal.js';
import { moveGoal } from '../actions/moveGoal.js';

export const GoalCreator = ({ goalDoerTgoId }: { goalDoerTgoId: TgoId }) => {
	const dispatch = useDispatch();
	const types = useSelector((store: RootStateType) => store.itemTypes);

	const [goalType, setGoalType] = useState<'movement' | 'inventoryRequirement'>('movement');
	const [goalInvReqType, setGoalInvReqType] = useState<TypeId | undefined>();
	const [goalInvReqAmount, setGoalInvReqAmount] = useState<number>(1);
	const [goalMovePosition, setGoalMovePosition] = useState<MapPositionType>({ x: 0, y: 0 } as MapPositionType);

	const possibleRecipes = Object.values(recipes)
		.filter(r => r.output.every(o => types[o.typeId]?.isStorable));

	return (
		<Category
			title={'Goal Creator'}
		>
			<form onSubmit={(e) => e.preventDefault()}>
				<label>Goal type</label>
				<select id="goalType" onChange={(e) => setGoalType(e.target.value as any)}>
					<option value={'movement'} selected={goalType === 'movement'}>Movement</option>
					<option value={'inventoryRequirement'} selected={goalType === 'inventoryRequirement'}>InventoryRequirement</option>
				</select>
				<br />
				{goalType === 'movement' && <MapPosition x={0} y={0} __TYPE__={'MapPosition'} />}
				{goalType === 'inventoryRequirement' && <>
					<select
						id="goalInvReqType"
						onChange={(e) => setGoalInvReqType(e.target.value as any)}
					>
						{possibleRecipes.map(r => (
							<option value={r.output[0].typeId} selected={r.output[0].typeId === goalInvReqType}>{types[r.output[0].typeId]?.label}</option>
						))}
					</select>
					<input type="number" value={goalInvReqAmount} onChange={(e) => setGoalInvReqAmount(parseInt(e.target.value))} />
				</>}
				<br />
				<button
					onClick={() => {
						switch(goalType) {
							case 'movement': {
								const targetPosition = { x: 0, y: 0 };
								dispatch(moveGoal(goalDoerTgoId, goalMovePosition));
								break;
							}
							case 'inventoryRequirement': {
								if (goalInvReqType === undefined)
									return;
								dispatch(itemReqGoal(goalDoerTgoId, [{ typeId: goalInvReqType, count: goalInvReqAmount }]));
								break;
							}
						}
					}}
				>
					Create Goal
				</button>
			</form>
		</Category>
	);
};
