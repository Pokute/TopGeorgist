import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { RootStateType } from '../reducers';

// interface Segment {
// 	cost: any,
// 	// progress: PropTypes.number,
// 	title: string,
// }

type Segment = any;

interface Type {
	costMapping?: (segment: Segment) => number,
	perFrameIncrease?: boolean,
	progress?: number,
	segments?: Array<Segment>,
};

type InternalType = Required<Type>;
type Props = Type & ReturnType<typeof mapStoreToProps>;
type InternalProps = InternalType & ReturnType<typeof mapStoreToProps>;

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
			{segments!.reduce(({components, costAcc}: { components: JSX.Element[], costAcc: number }, segment, i) => {
				const segmentProgress = Math.max(0, Math.min((tickPlusTimeProgress - costAcc) / costMapping!(segment), 1))
				return {
					components: [...components, (
						<div
							className='segment'
							key={`${segment.title}-${i}`}
							style={{ flex: costMapping!(segment) }}
						>
							{(segmentProgress > 0) && <div className='done' style={{ flex: (segmentProgress) }} />}
							{(segmentProgress < 1) && <div className='pending' style={{ flex: (1 - segmentProgress) }} />}
							<div className='title'>
								{segment.title}
							</div>
						</div>
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
	perFrameIncrease: true,
	progress: 0,
	segments: [],
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
