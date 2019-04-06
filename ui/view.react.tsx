import React from 'react';
import { connect } from 'react-redux';

import GameRenderer from './gameRenderer.react';
import VisitableUI from './visitableUI.react';
import { getMinMax } from '../utils/view';
import { ViewType } from '../reducers/view';
import { TgoId } from '../reducers/tgo';
import { RootStateType } from '../reducers';
import { MapType, MapSize, MapPosition } from '../reducers/map';
import Category from './Category';
import { hasComponentPosition, hasComponentVisitable, hasComponentLabel, hasComponentInventory } from '../components_new';

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
