import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { RootStateType } from '../reducers/index.js';

// interface Segment {
// 	cost: any,
// 	// progress: PropTypes.number,
// 	title: string,
// }

type Segment = any;

interface Type {
	readonly costMapping?: (segment: Segment) => number,
	readonly perFrameIncrease?: boolean,
	readonly progress?: number,
	readonly segments?: Array<Segment>,
};

type Props = Type & ReturnType<typeof mapStoreToProps>;

interface ProgressBarSegmentProps {
	readonly progressFraction: number,
	readonly cost: number,
	readonly title?: string
};

const ProgressBarSegment: React.SFC<ProgressBarSegmentProps> = ({
	progressFraction,
	cost,
	title,
}) => (
	<div
		className='segment'
		style={{ flex: cost }}
	>
		{(progressFraction > 0) && <div className='done' style={{ flex: (progressFraction) }} />}
		{(progressFraction < 1) && <div className='pending' style={{ flex: (1 - progressFraction) }} />}
		{title ?
			(<div className='title'>
				{title}
			</div>)
			: null
		}
	</div>
);
ProgressBarSegment.defaultProps = {
	title: undefined,
};

const ProgressBar: React.SFC<Props> = ({
	costMapping,
	perFrameIncrease,
	progress,
	segments,
	tickTime,
	tickInterval,
	frameTime,
}) => {
	const calcTickPlusTimeProgress = () => Math.max(0,
		Math.min(
			progress! + (perFrameIncrease
				? ((frameTime - tickTime) / tickInterval)
				: 0
			),
			segments!.reduce((cost, segment) => cost+costMapping!(segment), 0)
		)
	);

	// const shouldComponentUpdate = (nextProps: Props) => {
	// 	if (calcTickPlusTimeProgress(props) !== calcTickPlusTimeProgress(nextProps))
	// 		return true;
	// 	if (props.segments !== nextProps.segments)
	// 		return true;
		
	// 	return false;
	// }

	const totalCost = segments!.reduce((cost, segment) => cost+costMapping!(segment), 0);
	const tickPlusTimeProgress = calcTickPlusTimeProgress();
	return (
		<div className='progressBar'>
			{segments!.reduce(({components, costAcc}: { components: ReadonlyArray<JSX.Element>, costAcc: number }, segment, i) => {
				const segmentProgress = Math.max(0, Math.min((tickPlusTimeProgress - costAcc) / costMapping!(segment), 1))
				return {
					components: [...components, (
						<ProgressBarSegment
							key={`${segment.title}-${i}`}
							cost={costMapping!(segment)}
							progressFraction={segmentProgress}
							title={segment.title}
						/>
					)],
					costAcc: costAcc + costMapping!(segment),
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
ProgressBar.defaultProps = {
	costMapping: ({ cost }: { cost: number }) => cost,
	perFrameIncrease: false,
	progress: 0,
	segments: [{
		cost: 1,
	}],
};

// ProgressBar.propTypes = {
// 	costMapping: PropTypes.func,
// 	perFrameIncrease: PropTypes.bool,
// 	progress: PropTypes.number,
// 	segments: PropTypes.arrayOf(PropTypes.shape({
// 		cost: PropTypes.object,
// 		// progress: PropTypes.number,
// 		title: PropTypes.string,
// 	})),
// 	// From store
// 	tickTime: PropTypes.number.isRequired,
// 	tickInterval: PropTypes.number.isRequired,
// 	frameTime: PropTypes.number.isRequired,
// }

const mapStoreToProps = (store: RootStateType) => ({
	tickTime: store.ticker.tickTime,
	tickInterval: store.ticker.tickInterval,
	frameTime: store.frame.frameTime,
});

export default connect(mapStoreToProps)(ProgressBar);
