import { combineReducers } from 'redux'
import defaults from './defaults';
import itemTypes from './itemTypes';
import map from './map';
import tgos from './tgos';
import tileSets from './tileSets';
import views from './views';

const topGeorgist = combineReducers({
	defaults,
	itemTypes,
	map,
	tgos,
	tileSets,
	views,
});

export default topGeorgist
