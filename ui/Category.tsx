import * as React from 'react';
import { SFC } from 'react';

interface CategoryType {
	readonly title: string,
	readonly children?: React.ReactNode,
};

const Category: SFC<CategoryType> = ({ title, children }) => {
	return (
		<div className={'category'}>
			<div className={'category-title'}>{title}</div>
			{children}
		</div>
	)
};

export default Category;
