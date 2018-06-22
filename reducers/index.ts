import { combineReducers } from 'redux'
import clients from './clients';
import defaults from './defaults';
import frame from './frame';
import government from './government';
import itemTypes from './itemTypes';
import map from './map';
import tgos from './tgos';
import ticker from './ticker';
import tileSets from './tileSets';
import views from './views';

const topGeorgist = combineReducers({
	defaults,
});

// const topGeorgist = combineReducers({
// 	clients,
// 	defaults,
// 	frame,
// 	government,
// 	itemTypes,
// 	map,
// 	tgos,
// 	ticker,
// 	tileSets,
// 	views,
// });

export default topGeorgist;
