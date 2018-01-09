import { combineReducers } from 'redux'
import map from './map';
import tgos from './tgos';
import views from './views';
import tileSets from './tileSets';
import tileSet from './tileSet';

const topGeorgist = combineReducers({
	map,
	tgos,
	tileSets,
	views,
	playerId: (state = '', action) => action.type === 'DEFAULT_SET_PLAYER' ? action.tgoId : state,
	defaultViewId: (state = '', action) => action.type === 'DEFAULT_SET_VIEW' ? action.viewId : state,
});

export default topGeorgist
