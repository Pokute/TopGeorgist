import React from 'react';

import Category from './Category';

const About = () => (
	<Category
		title='About'
	>
		<p>
			Top Georgist, a under-progress game of economic strategy.
		</p>
		<p>
			Created by Pokute
		</p>
		<a href="https://github.com/Pokute/TopGeorgist" title="GitHub repository">
			<img id="github-icon" src="github-mark.svg" alt="GitHub logo"/>
		</a>
	</Category>
);

export default About;
