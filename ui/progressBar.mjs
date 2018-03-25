import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

class ProgressBar extends React.Component {
	calcTickPlusTimeProgress = (props) => Math.max(0,
		Math.min(
			props.progress + (props.perFrameIncrease
				? ((props.frameTime - props.tickTime) / props.tickInterval)
				: 0
			),
			props.segments.reduce((cost, segment) => cost+segment.cost, 0)
		)
	);

	shouldComponentUpdate = (nextProps) => {
		if (this.calcTickPlusTimeProgress(this.props) !== this.calcTickPlusTimeProgress(nextProps))
			return true;
		if (this.props.segments !== nextProps.segments)
			return true;
		
		return false;
	}

	render = () => {
		const props = this.props;
		const totalCost = props.segments.reduce((cost, segment) => cost+segment.cost, 0);
		const tickPlusTimeProgress = this.calcTickPlusTimeProgress(props);
		return (
			<div className='progressBar'>
				{props.segments.reduce(({components, costAcc, i}, segment) => {
					const segmentProgress = Math.max(0, Math.min((tickPlusTimeProgress - costAcc) / segment.cost, 1))
					return {
						components: [...components, (
							<div
								className='segment'
								key={`${segment.title}-${i}`}
								style={{ flex: segment.cost }}
							>
								{(segmentProgress > 0) && <div className='done' style={{ flex: (segmentProgress) }} />}
								{(segmentProgress < 1) && <div className='pending' style={{ flex: (1 - segmentProgress) }} />}
								<div className='title'>
									{segment.title}
								</div>
							</div>
						)],
						costAcc: costAcc + segment.cost,
					}
				},
				{
					components: [],
					costAcc: 0,
				})
					.components
				}
			</div>
		);
	}
}

ProgressBar.propTypes = {
	perFrameIncrease: PropTypes.bool,
	progress: PropTypes.number,
	segments: PropTypes.arrayOf(PropTypes.shape({
		cost: PropTypes.number,
		// progress: PropTypes.number,
		title: PropTypes.string,
	})),
	// From store
	tickTime: PropTypes.number.isRequired,
	tickInterval: PropTypes.number.isRequired,
	frameTime: PropTypes.number.isRequired,
}

ProgressBar.defaultProps = {
	perFrameIncrease: false,
	progress: 0,
	segments: [],
}

const mapStoreToProps = store => ({
	tickTime: store.ticker.tickTime,
	tickInterval: store.ticker.tickInterval,
	frameTime: store.frame.frameTime,
});

export default connect(mapStoreToProps)(ProgressBar);
