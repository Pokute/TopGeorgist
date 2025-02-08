import React from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';

import * as netActions from '../concerns/infra/net.js';
import { RootStateType } from '../reducers/index.js';
import Category from './Category.js';
import recipes from '../data/recipes.js';
import { ItemTypesState } from '../reducers/itemTypes.js';
import { TgosState } from '../reducers/tgos.js';
import { createWork } from '../concerns/work.js';
import { ComponentPosition, hasComponentPosition } from '../components/position.js';
import { ComponentVisitable, hasComponentVisitable } from '../data/components_new.js';
import { ComponentLabel, hasComponentLabel } from '../components/label.js';
import { mapPosition } from '../concerns/map.js';

interface Type {
};

const RecipesUI = ({ player, visitables } : ReturnType<typeof mapStoreToProps> & Type) => {
	const dispatch = useDispatch();
	const itemTypes = useSelector<RootStateType, ItemTypesState>(s => s.itemTypes)
	const tgos = useSelector<RootStateType, TgosState>(s => s.tgos);
	
	if (!player)
		return null;

	// const validRecipes = Object.values(recipes).reduce()

	return (<Category
		title={'Recipes'}
	>
		<ul>
			{Object.values(recipes).map(r => {
				return (
					<li
						key={r.type}
					>
						<button
							onClick={() => dispatch(netActions.send(createWork({
								recipe: r,
								workerTgoId: player.tgoId,
								inputInventoryTgoIds: [
									player.tgoId,
									...visitables.map(v => v.tgoId)
								],
							})))}
						>
							{r.type}
						</button>
					</li>
				);
			})}
		</ul>
	</Category>)
};

const mapStoreToProps = (state: RootStateType, passedProps: Type): {
	player?: ComponentPosition,
	visitables: Array<ComponentVisitable & ComponentLabel>,
} => {
	const tgos = Object.values(state.tgos);
	const labeled = tgos
		.filter(hasComponentLabel)
	labeled.map(l => l.label)

	const player = state.defaults.playerTgoId ? state.tgos[state.defaults.playerTgoId] : undefined;
	return {
		player: hasComponentPosition(player) ? player : undefined,
		visitables: player && hasComponentPosition(player) ?
			Object.values(state.tgos)
				.filter(tgo => hasComponentPosition(tgo) && mapPosition.matching(tgo.position, player.position))
				.filter(hasComponentVisitable)
				.filter(hasComponentLabel)
			: [],
	};
};

export default connect(mapStoreToProps)(RecipesUI);
