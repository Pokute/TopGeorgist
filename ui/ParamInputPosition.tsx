import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import React, { useState, useMemo } from 'react';

import { Parameter, ReactReduxParam, TypeProps } from './paramInput.js';
import * as viewActions from '../actions/view.js';
import { MapPosition } from '../concerns/map.js';
import { ViewId } from '../reducers/view.js';

export const paramInputPositionPack = (parameter: Parameter, formData: FormData) => ({
	[parameter.name]: {
		x: formData.get(`${parameter.name}-x`),
		y: formData.get(`${parameter.name}-y`),
	},
});

export const ParamInputPositionReact = ({ parameter, onPositionSelect }: TypeProps & ReturnType<typeof mapDispatchToProps>) => {
	const [pos, setPos] = useState({x: 0, y: 0});

	const parseNum = (field: 'x' | 'y') => (changeEvent: React.ChangeEvent<HTMLInputElement>) => {
		const num = Number.parseInt(changeEvent.currentTarget.value);
		if (!Number.isNaN(num)) {
			setPos({...pos, [field]: num});
		}
	};

	// Uncomment below when I figure out how to memoize properly.
	// const DimensionEntry = ({ dimension }: { dimension: 'x' | 'y' }) => (
	// 	<>
	// 		<label htmlFor={`param-${parameter.name}-${dimension}`}>{`${parameter.label} ${dimension}:`}</label>
	// 		<input
	// 			id={`param-${parameter.name}-${dimension}`}
	// 			type='text'
	// 			name={`${parameter.name}-${dimension}`}
	// 			value={pos[dimension]}
	// 			required
	// 			onChange={parseNum(dimension)}
	// 		/>
	// 	</>
	// )

	return (
		<div style={{ display: 'inline-block' }}>
			{/* <DimensionEntry dimension={'x'} /> */}
			{/* <DimensionEntry dimension={'y'} /> */}
			<label htmlFor={`param-${parameter.name}-x`}>{`${parameter.label} x:`}</label>
			<input
				id={`param-${parameter.name}-x`}
				type="text"
				name={`${parameter.name}-x`}
				value={pos.x}
				required
				onChange={parseNum('x')}
			/>
			<label htmlFor={`param-${parameter.name}-y`}>{`${parameter.label} y:`}</label>
			<input
				id={`param-${parameter.name}-y`}
				type="text"
				name={`${parameter.name}-y`}
				value={pos.y}
				required
				onChange={parseNum('y')}
			/>
			<button type="button" onClick={onPositionSelect(setPos)}>Select position</button>
		</div>
	)
};

type SetPosType = ({ x, y }: MapPosition) => void;

const mapDispatchToProps = (dispatch: Dispatch, passedProps: TypeProps) => ({
	onPositionSelect: (setPos: SetPosType) => () => dispatch(viewActions.clickActionStack.push(
		'main' as ViewId,
		{
			function: ({ position }: { position: MapPosition}) => setPos(position),
			popOnClick: true,
		},
	)),
});

export default connect(undefined, mapDispatchToProps)(ParamInputPositionReact);
