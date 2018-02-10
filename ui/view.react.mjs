import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import GameRenderer from './gameRenderer.react';
import VisitableUI from './visitableUI.react';

const View = props => (
	<div>
		<GameRenderer
			view={props.view}
			map={props.map}
		/>
		<div>
			{props.player ? 
				`Player calories: ${props.player.inventory.find(i => i.typeId === 'calories').count}`
				: undefined
			}
			{props.visitables.map(v =>
				<VisitableUI
					key={v.label}
					visitable={v}
					visitor={props.player}
				/>
			)}
		</div>
	</div>
);

const mapStoreToProps = state => {
	const player = state.tgos.find(tgo => tgo.tgoId === state.defaults.playerTgoId);
	return {
		player,
		visitables: player ? 
			state.tgos
				.filter(tgo => (tgo.position.x === player.position.x) && (tgo.position.y === player.position.y))
				.map(tgo => ({ ...tgo, type: state.itemTypes.find(it => it.typeId === tgo.typeId) }))
				.filter(tgo => tgo.visitable)
			: []
	};
};

const mapDispatchToProps = (dispatch, passedProps) => ({
	onActionClick: action => (() => dispatch(action.onClick(passedProps.ownerTgoId))),
});

View.propTypes = {
	viewId: PropTypes.any,
	followTogId: PropTypes.string,
	position: PropTypes.object,
	size: PropTypes.object,
};

export default connect(mapStoreToProps)(View);
