import { connect } from 'react-redux';

export type ReactParam = ({ parameter }: { parameter: Parameter}) => JSX.Element;
// Todo: ReturnType<typeof connect> is too permissive.
export type ReactReduxParam = ReturnType<typeof connect>;

export interface ParamType {
	render: ReactParam | ReactReduxParam,
	pack(parameter: Parameter, formData: FormData): {
		readonly [name: string]: any,
	},
};

export interface TypeMap {
	readonly [typeName: string]: ParamType,
};

export interface Parameter {
	readonly name: string,
	readonly label: string,
	readonly type: keyof TypeMap,
	readonly required?: boolean,
};
