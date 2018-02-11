import { combineReducers } from 'redux'
import clients from './clients';
import defaults from './defaults';
import government from './government';
import itemTypes from './itemTypes';
import map from './map';
import tgos from './tgos';
import tileSets from './tileSets';
import views from './views';

const topGeorgist = combineReducers({
	clients,
	defaults,
	government,
	itemTypes,
	map,
	tgos,
	tileSets,
	views,
});

export default topGeorgist
