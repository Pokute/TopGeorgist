import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

const View = () => (
	<p>View</p>
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
