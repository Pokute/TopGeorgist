import { combineReducers } from 'redux'
import map from './map';
import tgos from './tgos';
import view from './view';
import tileSets from './tileSets';
import tileSet from './tileSet';

const topGeorgist = combineReducers({
	map,
	tgos,
	tileSets,
	view,
});

export default topGeorgist
