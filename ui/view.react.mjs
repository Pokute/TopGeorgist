import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import GameRenderer from './gameRenderer.react';
import VisitableUI from './visitableUI.react';
import { getMinMax } from '../utils/view';

const View = props => (
	<div>
		<GameRenderer
			view={props.view}
			map={props.map}
			{...getMinMax(
				document.getElementById(props.view.canvasId),
				props.center,
				props.map,
			)}
		/>
		<div>
			{props.player ?
				`Player calories: ${props.player.inventory.find(i => i.typeId === 'calories').count}`
				: undefined
			}
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

const mapStoreToProps = (state, passedProps) => {
	const player = state.tgos[state.defaults.playerTgoId];
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

View.propTypes = {
	view: PropTypes.object,
	viewId: PropTypes.any,
	map: PropTypes.object,
	followTogId: PropTypes.string,
	position: PropTypes.object,
	size: PropTypes.object,
	// From store
	player: PropTypes.object,
	visitables: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default connect(mapStoreToProps)(View);
