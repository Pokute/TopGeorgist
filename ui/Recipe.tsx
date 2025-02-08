import React from 'react';

import Category from './Category.js';
import { Recipe as RecipeType, RecipeId as RecipeIdType } from '../concerns/recipe.js';
import recipes from '../data/recipes.js';

const Recipe = ({ recipe }: { recipe: RecipeType }) => {
	return (
		<Category title={`Recipe: ${recipe.type}`}>
			Inputs:<br/>
			<ul>
				{recipe.input.map(ii => (
					<li key={ii.tgoId ?? ii.typeId}>
						{ii.typeId
							? `${ii.typeId}: ${ii.count}`
							: `${ii.tgoId}: ${ii.count}`
						}
					</li>
				))}
			</ul>
			Outputs:<br/>
			<ul>
				{recipe.output.map(ii => (
					<li key={ii.tgoId ?? ii.typeId}>
						{ii.typeId
							? `${ii.typeId}: ${ii.count}`
							: `${ii.tgoId}: ${ii.count}`
						}
					</li>
				))}
			</ul>
		</Category>
	)
};

export const RecipeId = ({ recipeId }: { recipeId: RecipeIdType }) => {
	const recipe = recipes[recipeId];
	if (!recipe)
		return (<div>Could not find recipe {recipeId}</div>);

	return (
		<Recipe recipe={recipe} />
	);
};

export default Recipe;
