import * as React from 'react';

interface CategoryType {
	readonly title: string,
	readonly children?: React.ReactNode,
};

const Category = ({ title, children }: CategoryType) => {
	return (
		<div className={'category'}>
			<div className={'category-title'}>{title}</div>
			{children}
		</div>
	)
};

export default Category;
