import React from 'react';

import ParamInputPosition, { paramInputPositionPack, ParamInputPositionReact } from './ParamInputPosition.tsx';
import { type Parameter, type TypeMap } from './ParamInputType.ts';

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
