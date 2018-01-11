import { combineReducers } from 'redux'
import itemTypes from './itemTypes';
import map from './map';
import tgos from './tgos';
import tileSets from './tileSets';
import views from './views';

const topGeorgist = combineReducers({
	itemTypes,
	map,
	tgos,
	tileSets,
	views,
	playerId: (state = '', action) => action.type === 'DEFAULT_SET_PLAYER' ? action.tgoId : state,
	defaultViewId: (state = '', action) => action.type === 'DEFAULT_SET_VIEW' ? action.viewId : state,
});

export default topGeorgist
