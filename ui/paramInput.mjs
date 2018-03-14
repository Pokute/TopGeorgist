import React from 'react';

const ParamInputPosition = ({ parameter }) => (
	<div style={{ display: 'inline-block' }}>
		<label htmlFor={`param-${parameter.name}-x`}>{`${parameter.label} x:`}</label>
		<input id={`param-${parameter.name}-x`} type="text" name={`${parameter.name}-x`} required />
		<label htmlFor={`param-${parameter.name}-y`}>{`${parameter.label} y:`}</label>
		<input id={`param-${parameter.name}-y`} type="text" name={`${parameter.name}-y`} required />
	</div>
);

const paramInputPositionPack = (parameter, formData) => ({
	[parameter.name]: {
		x: formData.get(`${parameter.name}-x`),
		y: formData.get(`${parameter.name}-y`),
	},
});

const typeMap = {
	'position': { render: ParamInputPosition, pack: paramInputPositionPack } ,
};

const ParamInput = props => typeMap[props.parameter.type].render(props);

export const packParam = (parameter, formData) => typeMap[parameter.type].pack(parameter, formData);

export default ParamInput;
