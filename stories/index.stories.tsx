import React, { useState } from 'react';
import { Provider } from 'react-redux';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { linkTo } from '@storybook/addon-links';

// import { Button, Welcome } from '@storybook/react/demo';
import ProgressBar from '../ui/progressBar.js';

import { store } from '../store.js';

import '../static/style/topGeorgist.css';

// storiesOf('Welcome', module).add('to Storybook', () => <Welcome showApp={linkTo('Button')} />);

// storiesOf('Button', module)
// 	.add('with text', () => <Button onClick={action('clicked')}>Hello Button</Button>)
// 	.add('with some emoji', () => (
// 		<Button onClick={action('clicked')}>
// 			<span role="img" aria-label="so cool">
// 				😀 😎 👍 💯
// 			</span>
// 		</Button>
// 	));

interface ProgressIncreaser { children: (progress: number) => JSX.Element, maxCost: number, step?: number, initialProgress?: number };
const ProgressIncreaser: React.SFC<ProgressIncreaser> = ({ children, maxCost, step, initialProgress }) => {
	const [ progress, setProgress ] = useState(initialProgress!);
	return (
		<>
			{children(progress)}
			<button
				onClick={() => setProgress((oldProgress: number) => (oldProgress + step!) % maxCost)}
			>
				Increase progress by {step}.
			</button>
		</>
	);
};
ProgressIncreaser.defaultProps = {
	step: 1,
	initialProgress: 0,
};

storiesOf('ProgressBar', module)
	.addDecorator(story => <Provider store={store}>{story()}</Provider>)
	.add('Empty', () => <ProgressBar />)
	.add('Progress only 0-1', () => (<ProgressIncreaser
			maxCost={1}
			initialProgress={0.5}
			step={0.125}
		>
			{progress => (
				<ProgressBar
					progress={progress}
				/>
			)}
		</ProgressIncreaser>))
	// .add('Progress and cost only', () => <ProgressBar
	// 		progress={2.5}
	// 		cost={4}
	// 	/>)
	.add('One item', () => (<ProgressIncreaser
			maxCost={5}
			initialProgress={2}
		>
			{progress => (
				<ProgressBar
					progress={progress}
					segments={[
						{ cost: 5, title: 'One item.' }
					]}
				/>
			)}
		</ProgressIncreaser>))
	.add('Multiple segments', () => (<ProgressIncreaser
			maxCost={22}
			initialProgress={8}
		>
			{progress => (
				<ProgressBar
					progress={progress}
					segments={[
						{ cost: 5, title: 'Cost of 5.' },
						{ cost: 10, title: '10.' },
						{ cost: 7, title: 'Seven.' },
					]}
				/>
			)}
		</ProgressIncreaser>))
	.add('redux & framerate', () => <ProgressBar
		segments={[
			{ cost: 5, title: 'One item.' }
		]}
	/>)
;
