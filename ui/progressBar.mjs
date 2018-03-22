import React from 'react';
import PropTypes from 'prop-types';

const ProgressBar = (props) => {
	const totalCost = props.segments.reduce((cost, segment) => cost+segment.cost, 0);
	return (
		<div className='progressBar'>
			{props.segments.map((segment, i) => {
				const segmentProgress = Math.max(0, Math.min((props.progress - i), 1))
				return (
					<div
						className='segment'
						key={`${segment.title}-${i}`}
						style={{ flex: segment.cost }}
					>
						<div className='done' style={{ flex: (segmentProgress) }} />
						<div className='pending' style={{ flex: (1 - segmentProgress) }} />
					</div>
				)
			})}
		</div>
	);
}

ProgressBar.propTypes = {
	progress: PropTypes.number,
	segments: PropTypes.arrayOf(PropTypes.shape({
		cost: PropTypes.number,
		// progress: PropTypes.number,
		title: PropTypes.string,
	})),
}

PropTypes.defaultProps = {
	progress: 0,
	segments: [],
}

export default ProgressBar;
