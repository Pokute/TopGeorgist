import React from 'react';
import { connect } from 'react-redux';

const VisitableGovernmentBuilding = props => (
	<ul>
		<li>{'Government info:'}</li>
		<li>{`Citizens: ${props.government.citizens.length}`}</li>
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

const mapStoreToProps = state => ({
	government: state.government,
	citizen: state.government.citizens.find(c => c.tgoId === state.defaults.playerTgoId),
});

export default connect(mapStoreToProps)(VisitableGovernmentBuilding);
