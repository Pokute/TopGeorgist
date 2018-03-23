import React from 'react';
import PropTypes from 'prop-types';

const ProgressBar = (props) => {
	const totalCost = props.segments.reduce((cost, segment) => cost+segment.cost, 0);
	return (
		<div className='progressBar'>
			{props.segments.reduce(({components, costAcc, i}, segment) => {
				const segmentProgress = Math.max(0, Math.min((props.progress - costAcc) / segment.cost, 1))
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
