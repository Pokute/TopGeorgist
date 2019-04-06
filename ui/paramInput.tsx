import React from 'react';
import ParamInputPosition, { paramInputPositionPack, ParamInputPositionReact } from './ParamInputPosition';
import { connect } from 'react-redux';

export interface Parameter {
	readonly name: string,
	readonly label: string,
	readonly type: keyof TypeMap,
	readonly required?: boolean,
};

export type ReactParam = ({ parameter }: { parameter: Parameter}) => JSX.Element;
// Todo: ReturnType<typeof connect> is too permissive.
export type ReactReduxParam = ReturnType<typeof connect>;

export interface ParamType {
	render: ReactParam | ReactReduxParam,
	pack(parameter: Parameter, formData: FormData): {
		readonly [name: string]: any,
	},
};

export interface TypeMap {
	readonly [typeName: string]: ParamType,
};

const typeMap: TypeMap = {
	// positionOld: { render: ParamInputPositionReact, pack: paramInputPositionPack } ,
	position: { render: ((props: any) => (<ParamInputPosition {...props} />)), pack: paramInputPositionPack } ,
};

export interface TypeProps {
	readonly parameter: Parameter,
};

const ParamInput = (props: TypeProps) => {
	// const C = typeMap[props.parameter.type].render;
	return (<ParamInputPosition {...props} />);
	// return typeMap[props.parameter.type].render(props);
}

export const packParam = (parameter: Parameter, formData: FormData) => typeMap[parameter.type].pack(parameter, formData);

export default ParamInput;
