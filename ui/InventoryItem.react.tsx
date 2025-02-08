import React from 'react';
import { InventoryItem, ComponentInventory, Inventory } from '../concerns/inventory.js';
import { useSelector, useDispatch } from 'react-redux';
import { RootStateType } from '../reducers/index.js';
import { Recipe } from '../concerns/recipe.js';

const InventoryItem = ({
	ii,
	possibleRecipes
}: {
	ii: InventoryItem,
	possibleRecipes: Array<Recipe>
}) => {
	const dispatch = useDispatch();
	const subInventory = useSelector<RootStateType, Inventory>(state => (
		ii.tgoId
			? state.tgos[ii.tgoId]?.inventory
			: state.itemTypes[ii.typeId]?.inventory
		) ?? []);

	if (!subInventory) {
		return null;
	}

	const validRecipes = possibleRecipes
		.filter(recipe => recipe.output.length > 0)
		.filter(recipe => recipe.output.every(
			recipeOutputIten => subInventory.some(subInventoryItem => (subInventoryItem.typeId === recipeOutputIten.typeId) && (subInventoryItem.count >= recipeOutputIten.count))
		));

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
