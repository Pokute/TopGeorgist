import { combineReducers } from 'redux'
import clients, { ClientsState } from './clients';
import defaults, { type as DefaultsType } from './defaults';
import frame, { FrameStateType } from './frame';
import government from './government';
import itemTypes, { ItemTypesState } from './itemTypes';
import map, { MapType } from './map';
import tgos, { TgosState } from './tgos';
import ticker, { TickerStateType } from './ticker';
import tileSets, { TileSetsState } from './tileSets';
import views, { ViewsState } from './views';

export interface RootStateType {
	clients: ClientsState,
	defaults: DefaultsType,
	frame: FrameStateType,
	// government: GovernmentStateType,
	itemTypes: ItemTypesState,
	map: MapType,
	tgos: TgosState,
	ticker: TickerStateType,
	tileSets: TileSetsState,
	view: ViewsState,
};

const topGeorgist = combineReducers({
	clients,
	defaults,
	frame,
	// government,
	itemTypes,
	map,
	tgos,
	ticker,
	tileSets,
	views,
});

export default topGeorgist;
