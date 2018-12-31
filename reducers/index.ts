import { combineReducers } from 'redux'
import accounts, { AccountsState } from './accounts';
import connection, { ConnectionStateType } from './connection';
import clients, { ClientsState } from './clients';
import defaults, { type as DefaultsType } from './defaults';
import frame, { FrameStateType } from './frame';
import government, { GovernmentStateType } from './government';
import itemTypes, { ItemTypesState } from './itemTypes';
import map, { MapType } from './map';
import tgos, { TgosState } from './tgos';
import ticker, { TickerStateType } from './ticker';
import tileSets, { TileSetsState } from './tileSets';
import views, { ViewsState } from './views';

export interface RootStateType {
	accounts: AccountsState,
	connection: ConnectionStateType,
	clients: ClientsState,
	defaults: DefaultsType,
	frame: FrameStateType,
	government: GovernmentStateType,
	itemTypes: ItemTypesState,
	map: MapType,
	tgos: TgosState,
	ticker: TickerStateType,
	tileSets: TileSetsState,
	views: ViewsState,
};

const topGeorgist = combineReducers({
	accounts,
	connection,
	clients,
	defaults,
	frame,
	government,
	itemTypes,
	map,
	tgos,
	ticker,
	tileSets,
	views,
});

export default topGeorgist;
