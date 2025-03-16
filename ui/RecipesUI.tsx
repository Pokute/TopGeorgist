import React from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';

import * as netActions from '../concerns/infra/net.ts';
import { type RootStateType } from '../reducers/index.ts';
import Category from './Category.tsx';
import recipes from '../data/recipes.ts';
import { type ItemTypesState } from '../reducers/itemTypes.ts';
import { type TgosState } from '../concerns/tgos.ts';
import { createWork } from '../concerns/work.ts';
import { type ComponentPosition, hasComponentPosition } from '../components/position.ts';
import { type ComponentVisitable, hasComponentVisitable } from '../data/components_new.ts';
import { type ComponentLabel, hasComponentLabel } from '../components/label.ts';
import { mapPosition } from '../concerns/map.ts';

interface Type {
};

const RecipesUI = ({ player, visitables } : ReturnType<typeof mapStoreToProps> & Type) => {
	const dispatch = useDispatch();
	const itemTypes = useSelector<RootStateType, ItemTypesState>(s => s.itemTypes)
	const tgos = useSelector<RootStateType, TgosState>(s => s.tgos);
	
	if (!player)
		return null;

	// TODO: filter to just list valid recipes.

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
								outputInventoryTgoId: player.tgoId,
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
