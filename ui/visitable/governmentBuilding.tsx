import React from 'react';
import { connect } from 'react-redux';
import { RootStateType } from '../../reducers/index.js';

const VisitableGovernmentBuilding = (props: ReturnType<typeof mapStoreToProps>) => (
	<ul>
		<li>{'Government info:'}</li>
		<li>{`Citizens: ${Object.keys(props.government.citizens).length}`}</li>
		{props.citizen === undefined
			? <li>{'You are not a citizen yet'}</li>
			: (
				<li>
					<ul>
						<li>{'You\'re a citizen!'}</li>
						<li>{`Current stipend amount: ${props.citizen.stipend}`}</li>
					</ul>
				</li>
			)
		}
	</ul>
);

const mapStoreToProps = (state: RootStateType) => ({
	government: state.government,
	citizen: state.defaults.playerTgoId ? state.government.citizens[state.defaults.playerTgoId] : undefined,
});

export default connect(mapStoreToProps)(VisitableGovernmentBuilding);
