import React from 'react';

export interface Parameter {
	readonly name: string,
	readonly label: string,
	readonly type: keyof TypeMap,
	readonly required?: boolean,
};

const ParamInputPosition = ({ parameter }: { parameter: Parameter}) => (
	<div style={{ display: 'inline-block' }}>
		<label htmlFor={`param-${parameter.name}-x`}>{`${parameter.label} x:`}</label>
		<input id={`param-${parameter.name}-x`} type="text" name={`${parameter.name}-x`} required />
		<label htmlFor={`param-${parameter.name}-y`}>{`${parameter.label} y:`}</label>
		<input id={`param-${parameter.name}-y`} type="text" name={`${parameter.name}-y`} required />
	</div>
);

const paramInputPositionPack = (parameter: Parameter, formData: FormData) => ({
	[parameter.name]: {
		x: formData.get(`${parameter.name}-x`),
		y: formData.get(`${parameter.name}-y`),
	},
});

export interface ParamType {
	render({ parameter }: { parameter: Parameter}): JSX.Element,
	pack(parameter: Parameter, formData: FormData): {
		readonly [name: string]: any,
	},
};

export interface TypeMap {
	readonly [typeName: string]: ParamType,
};

const typeMap: TypeMap = {
	position: { render: ParamInputPosition, pack: paramInputPositionPack } ,
};

export interface Type {
	readonly parameter: Parameter,
};

const ParamInput = (props: Type) => typeMap[props.parameter.type].render(props);

export const packParam = (parameter: Parameter, formData: FormData) => typeMap[parameter.type].pack(parameter, formData);

export default ParamInput;
