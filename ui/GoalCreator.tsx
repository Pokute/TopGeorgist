import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootStateType } from '../reducers/index.js';
import { TgoId } from '../reducers/tgo.js';
import Category from './Category.js';
import MapPosition from './MapPosition.js';
import { MapPosition as MapPositionType } from '../concerns/map.js';
import recipes from '../data/recipes.js';
import { TypeId } from '../reducers/itemType.js';
import { itemReqGoal } from '../concerns/itemReqGoal.js';
import { moveGoal } from '../actions/moveGoal.js';
import { itemKeepMinGoal } from '../concerns/itemKeepMinGoal.js';

export const GoalCreator = ({ goalDoerTgoId }: { goalDoerTgoId: TgoId }) => {
	const dispatch = useDispatch();
	const types = useSelector((store: RootStateType) => store.itemTypes);

	const [goalType, setGoalType] = useState<'movement' | 'inventoryRequirement' | 'InventoryKeepMinimumRequirement'>('movement');
	const [goalInvReqType, setGoalInvReqType] = useState<TypeId | undefined>();
	const [goalInvReqAmount, setGoalInvReqAmount] = useState<number>(1);
	const [goalInvCompleteOnMinimumReached, setGoalInvCompleteOnMinimumReached] = useState<boolean>(false);
	const [goalMovePosition, setGoalMovePosition] = useState<MapPositionType>({ x: 0, y: 0 } as MapPositionType);

	const possibleRecipes = Object.values(recipes)
		.filter(r => r.output.every(o => types[o.typeId]?.isStorable));

	return (
		<Category
			title={'Goal Creator'}
		>
			<form onSubmit={(e) => e.preventDefault()}>
				<label>Goal type</label>
				<select
					id="goalType"
					onChange={(e) => setGoalType(e.target.value as any)}
					value={goalType}
				>
					<option value={'movement'}>Movement</option>
					<option value={'inventoryRequirement'} defaultChecked>InventoryRequirement</option>
					<option value={'InventoryKeepMinimumRequirement'}>InventoryKeepMinimumRequirement</option>
				</select>
				<br />
				{goalType === 'movement' && <MapPosition x={0} y={0} __TYPE__={'MapPosition'} />}
				{goalType === 'inventoryRequirement' && <>
					<select
						id="goalInvReqType"
						onChange={(e) => setGoalInvReqType(e.target.value as any)}
						value={goalInvReqType}
					>
						{possibleRecipes.map(r => (
							<option
								value={r.output[0].typeId}
								key={r.output[0].typeId}
							>
								{types[r.output[0].typeId]?.label} - {r.type}
							</option>
						))}
					</select>
					<input
						type="number"
						value={goalInvReqAmount}
						onChange={(e) => setGoalInvReqAmount(parseInt(e.target.value))}
						min={1}
					/>
				</>}
				{goalType === 'InventoryKeepMinimumRequirement' && <>
					<select
						id="goalInvReqType"
						onChange={(e) => setGoalInvReqType(e.target.value as any)}
						value={goalInvReqType}
					>
						{possibleRecipes.map(r => (
							<option
								value={r.output[0].typeId}
								key={r.output[0].typeId}
							>
								{types[r.output[0].typeId]?.label} - {r.type}
							</option>
				))}
					</select>
					<input
						type="number"
						value={goalInvReqAmount}
						onChange={(e) => setGoalInvReqAmount(parseInt(e.target.value))}
						min={1}
					/>
					<br />
					<label htmlFor="goalInvCompleteOnMinimumReached">goalInvCompleteOnMinimumReached</label>
					<input
						id="goalInvCompleteOnMinimumReached"
						type="checkbox"
						checked={goalInvCompleteOnMinimumReached}
						onChange={(e) => setGoalInvCompleteOnMinimumReached(e.target.checked)}
					/>
				</>}
				<br />
				<button
					onClick={() => {
						switch(goalType) {
							case 'movement': {
								dispatch(moveGoal(goalDoerTgoId, goalMovePosition));
								break;
							}
							case 'inventoryRequirement': {
								if (goalInvReqType === undefined)
									return;
								dispatch(itemReqGoal(goalDoerTgoId, [{ typeId: goalInvReqType, count: goalInvReqAmount }]));
								break;
							}
							case 'InventoryKeepMinimumRequirement': {
								if (goalInvReqType === undefined)
									return;
								dispatch(itemKeepMinGoal(goalDoerTgoId, [{ typeId: goalInvReqType, count: goalInvReqAmount }], goalInvCompleteOnMinimumReached));
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
