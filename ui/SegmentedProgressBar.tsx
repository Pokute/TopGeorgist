import React from 'react';
import { connect } from 'react-redux';
import { RootStateType } from '../reducers/index.js';

interface Segment {
	readonly cost: number,
	readonly progress: number,
	readonly title: string,
}

interface Type {
	readonly segments: Array<Segment>,
	readonly costMapping?: (segment: Segment) => number,
};

type InternalType = Required<Type>;
type Props = Type;

const SegmentedProgressBar: React.SFC<Props> = ({ segments, costMapping }) => {

	const clampedSegmentProgress = ({ cost, progress }: Segment) =>
		Math.max(0, (Math.min(progress, cost)));

	// const isSameSegment = (a: Segment, b: Segment) => (
	// 	a == b ||
	// 	a.cost == b.cost &&
	// 	a.title == b.title &&
	// 	SegmentedProgressBar
	// 		.clampedSegmentProgress(mappedSegment(a)) ==
	// 		SegmentedProgressBar
	// 			.clampedSegmentProgress(mappedSegment(b))
	// );

	const mappedSegment = (segment: Segment) => ({
		...segment,
		progress: costMapping!(segment),
	});

	// const shouldComponentUpdate = (nextProps: Props) => {

	// 	if (nextProps.segments.length !== props.segments.length) return true;
	// 	if (nextProps.costMapping !== props.costMapping) return true;

	// 	props.segments.some((segment: Segment, i) =>
	// 		!isSameSegment(segment, nextProps.segments[i])
	// 	);
		
	// 	return false;
	// }

	// const mappedAndClampedProgress = SegmentedProgressBar.clampedSegmentProgress(mappedSegment(a));
	const totalCost = segments.reduce((cost, segment) => cost+costMapping!(segment), 0);
	return (
		<div className='progressBar'>
			{segments!.reduce(({components, costAcc}: { components: ReadonlyArray<JSX.Element>, costAcc: number }, segment, i) => {
				const segmentProgress = clampedSegmentProgress(mappedSegment(segment)) / segment.cost;
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
};
SegmentedProgressBar.defaultProps = {
	costMapping: ({ cost }: { cost: number }) => cost,
	segments: [],
};

export default SegmentedProgressBar;
