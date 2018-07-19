import React from 'react';
import { connect } from 'react-redux';

import GameRenderer from './gameRenderer.react';
import VisitableUI from './visitableUI.react';
import { getMinMax } from '../utils/view';
import { ViewType } from '../reducers/view';
import { TgoId } from '../reducers/tgo';
import { RootStateType } from '../reducers';
import { MapType } from '../reducers/map';

export interface Type {
	view: ViewType,
	map: MapType,
	followTgoId?: TgoId,
	position?: { x: number, y: number },
	size?: { x: number, y: number },
};

const View = (props: ReturnType<typeof mapStoreToProps> & Type) => {
	let displayedCalories = 0;
	if (props.player && props.player.inventory) {
		const caloriesItem = props.player.inventory.find(i => i.typeId === 'calories');
		if (caloriesItem) displayedCalories = caloriesItem.count;
	}
	return (
		<div>
			<GameRenderer
				view={props.view}
				map={props.map}
				{...getMinMax(
					document.getElementById(props.view.canvasId || ''),
					props.center,
					props.map,
				)}
			/>
			<div>
				{`Player calories: ${displayedCalories}`}
				{props.visitables.map(v => (
					<VisitableUI
						key={v.label}
						visitable={v}
						visitor={props.player}
					/>
				))}
			</div>
		</div>
	);
};

const mapStoreToProps = (state: RootStateType, passedProps: Type) => {
	const player = state.defaults.playerTgoId ? state.tgos[state.defaults.playerTgoId] : undefined;
	return {
		player,
		visitables: player ?
			Object.values(state.tgos)
				.filter(tgo => (tgo.position.x === player.position.x)
					&& (tgo.position.y === player.position.y))
				.map(tgo => ({ ...tgo, type: state.itemTypes[tgo.typeId] }))
				.filter(tgo => tgo.visitable)
			: [],
		center: (passedProps.view.followTgoId && state.tgos[passedProps.view.followTgoId])
			? state.tgos[passedProps.view.followTgoId].position
			: passedProps.view.position,
	};
};

export default connect(mapStoreToProps)(View);
