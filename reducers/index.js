import { combineReducers } from 'redux'
import tgos from './tgos';
import view from './view';

const topGeorgist = combineReducers({
	tgos,
	view,
});

export default topGeorgist
