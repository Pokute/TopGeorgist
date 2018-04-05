import React from 'react';
import { Provider } from 'react-redux';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { linkTo } from '@storybook/addon-links';

import { Button, Welcome } from '@storybook/react/demo';
import ProgressBar from '../ui/progressBar';

import { store } from '../store';

import '../static/style/topGeorgist.css';

storiesOf('Welcome', module).add('to Storybook', () => <Welcome showApp={linkTo('Button')} />);

storiesOf('Button', module)
	.add('with text', () => <Button onClick={action('clicked')}>Hello Button</Button>)
	.add('with some emoji', () => (
		<Button onClick={action('clicked')}>
			<span role="img" aria-label="so cool">
				😀 😎 👍 💯
			</span>
		</Button>
	));

storiesOf('ProgressBar', module)
	.addDecorator(story => <Provider store={store}>{story()}</Provider>)
	.add('Empty', () => <ProgressBar />)
	.add('One item', () => <ProgressBar
			segments={[
				{ cost: 5, title: 'One item.' }
			]}
		/>);
