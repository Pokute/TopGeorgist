import React from 'react';
import { connect } from 'react-redux';

import GameRenderer from './gameRenderer.react.js';
import VisitableUI from './visitableUI.react.js';
import { getMinMax } from '../utils/view.js';
import { ViewType } from '../reducers/view.js';
import { TgoId } from '../reducers/tgo.js';
import { RootStateType } from '../reducers.js';
import { MapType, MapSize, MapPosition } from '../reducers/map.js';
import Category from './Category.js';
import { hasComponentVisitable } from '../data/components_new.js';
import { hasComponentInventory } from '../components/inventory.js';
import { hasComponentPosition } from '../components/position.js';
import { hasComponentLabel } from '../components/label.js';

export interface Type {
	readonly view: ViewType,
	readonly map: MapType,
	readonly followTgoId?: TgoId,
	readonly position?: MapPosition,
	readonly size?: MapSize,
};

const View = (props: ReturnType<typeof mapStoreToProps> & Type) => {
	if (!props.view.canvasId) return null;
	let displayedCalories = 0;
	if (props.player && hasComponentInventory(props.player)) {
		const caloriesItem = props.player.inventory.find(i => i.typeId === 'calories');
		if (caloriesItem) displayedCalories = caloriesItem.count;
	}
	return (
		<div>
			<GameRenderer
				view={props.view}
				map={props.map}
				{...getMinMax(
					document.getElementById(props.view.canvasId) as HTMLCanvasElement,
					props.center,
					props.map,
				)}
			/>
			<Category
				title={'Visitables'}
			>
				{props.visitables.map(v => (
					<VisitableUI
						key={v.label}
						visitable={v}
						visitor={props.player}
					/>
				))}
			</Category>
		</div>
	);
};

const mapStoreToProps = (state: RootStateType, passedProps: Type) => {
	const tgos = Object.values(state.tgos);
	const labeled = tgos
		.filter(hasComponentLabel)
	labeled.map(l => l.label)

	const player = state.defaults.playerTgoId ? state.tgos[state.defaults.playerTgoId] : undefined;
	const followedTgo = passedProps.view.followTgoId && state.tgos[passedProps.view.followTgoId];
	return {
		player,
		visitables: player && hasComponentPosition(player) ?
			Object.values(state.tgos)
				.filter(tgo => hasComponentPosition(tgo) && (tgo.position.x === player.position.x)
					&& (tgo.position.y === player.position.y))
				.filter(hasComponentVisitable)
				.filter(hasComponentLabel)
			: [],
		center: (followedTgo && hasComponentPosition(followedTgo))
			? followedTgo.position
			: passedProps.view.position,
	};
};

export default connect(mapStoreToProps)(View);
