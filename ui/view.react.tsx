import React, { useState } from 'react';
import { connect } from 'react-redux';

import GameRenderer from './gameRenderer.react.tsx';
import VisitableUI from './visitableUI.react.tsx';
import { getMinMax } from '../utils/view.ts';
import { type ViewType } from '../reducers/view.ts';
import { type TgoId } from '../reducers/tgo.ts';
import { type RootStateType } from '../reducers/index.ts';
import { type MapType, type MapSize, mapPosition, type MapPosition } from '../concerns/map.ts';
import Category from './Category.tsx';
import { type ComponentVisitable, hasComponentVisitable } from '../data/components_new.ts';
import { hasComponentInventory } from '../concerns/inventory.ts';
import { type ComponentPosition, hasComponentPosition } from '../components/position.ts';
import { type ComponentLabel, hasComponentLabel } from '../components/label.ts';

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

	const [viewPan, setViewPan] = useState<MapPosition>({ x: 0, y: 0 } as MapPosition);

	return (
		<div>
			<GameRenderer
				view={props.view}
				map={props.map}
				{...getMinMax(
					document.getElementById(props.view.canvasId) as HTMLCanvasElement,
					{
						x: props.center.x + viewPan.x,
						y: props.center.y + viewPan.y,
					}  as MapPosition,
					props.map,
				)}
				panView={({ x, y }) => setViewPan({ x: viewPan.x + x, y: viewPan.y + y } as MapPosition)}
			/>
			<Category
				title={'Visitables'}
			>
				{props.player && props.visitables.map(v => (
					<VisitableUI
						key={v.label}
						visitable={v}
						visitor={props.player!}
					/>
				))}
			</Category>
		</div>
	);
};

const mapStoreToProps = (state: RootStateType, passedProps: Type): {
	player?: ComponentPosition,
	visitables: Array<ComponentVisitable & ComponentLabel>,
	center: MapPosition,
} => {
	const tgos = Object.values(state.tgos);
	const labeled = tgos
		.filter(hasComponentLabel)
	labeled.map(l => l.label)

	const player = state.defaults.playerTgoId ? state.tgos[state.defaults.playerTgoId] : undefined;
	const followedTgo = passedProps.view.followTgoId && state.tgos[passedProps.view.followTgoId];
	return {
		player: hasComponentPosition(player) ? player : undefined,
		visitables: player && hasComponentPosition(player) ?
			Object.values(state.tgos)
				.filter(tgo => hasComponentPosition(tgo) && mapPosition.matching(tgo.position, player.position))
				.filter(hasComponentVisitable)
				.filter(hasComponentLabel)
			: [],
		center: (followedTgo && hasComponentPosition(followedTgo))
			? followedTgo.position
			: passedProps.view.position,
	};
};

export default connect(mapStoreToProps)(View);
