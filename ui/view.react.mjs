import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import GameRenderer from './gameRenderer.react';

const View = props => (
	<div>
		<GameRenderer
			view={props.view}
			map={props.map}
		/>
	</div>
);

const mapStateToProps = state => ({

});

View.propTypes = {
	viewId: PropTypes.any,
	followTogId: PropTypes.string,
	position: PropTypes.object,
	size: PropTypes.object,
};

export default connect(mapStateToProps)(View);
