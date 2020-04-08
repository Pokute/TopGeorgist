import React from 'react';
import { InventoryItem, ComponentInventory, Inventory } from '../components/inventory';
import { useSelector, useDispatch } from 'react-redux';
import { RootStateType } from '../reducers';
import { Recipe } from '../reducers/recipe';

const InventoryItem = ({
	ii,
	possibleRecipes
}: {
	ii: InventoryItem,
	possibleRecipes: Array<Recipe>
}) => {
	const dispatch = useDispatch();
	const iiInventory = useSelector<RootStateType, Inventory>(state => (
		ii.tgoId
			? state.tgos[ii.tgoId]?.inventory
			: state.itemTypes[ii.typeId]?.inventory
		) ?? []);

	if (!iiInventory) {
		return null;
	}

	const validRecipes = possibleRecipes
		.filter(recipe => recipe.output.length > 0)
		.filter(recipe => recipe.output.every(wtic => iiInventory.some(iii => (iii.typeId === wtic.typeId) && (iii.count >= wtic.count))));

	return (<>
		{validRecipes.map(validRecipe => (
			<button
				key={validRecipe.type}
				// onClick={props.onComponentActionClick(ca, i.typeId)}
				onClick={() => dispatch({ type: 'FOO' })}
			>
				{validRecipe.type}
			</button>
		))}
	</>);
}

export default InventoryItem;
