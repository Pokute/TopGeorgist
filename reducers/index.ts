import { combineReducers } from 'redux'
import accounts, { AccountsState } from './accounts';
import serverConnection, { ServerConnectionStateType } from './serverConnection';
import clients, { ClientsState } from './clients';
import defaults, { Type as DefaultsType } from './defaults';
import frame, { FrameStateType } from './frame';
import government, { GovernmentStateType } from './government';
import itemTypes, { ItemTypesState } from './itemTypes';
import map, { MapType } from './map';
import tgos, { TgosState } from './tgos';
import ticker, { TickerStateType } from './ticker';
import tileSets, { TileSetsState } from './tileSets';
import views, { ViewsState } from './views';

export interface RootStateType {
	readonly accounts: AccountsState,
	readonly clients: ClientsState,
	readonly defaults: DefaultsType,
	readonly frame: FrameStateType,
	readonly government: GovernmentStateType,
	readonly itemTypes: ItemTypesState,
	readonly map: MapType,
	readonly serverConnection: ServerConnectionStateType,
	readonly tgos: TgosState,
	readonly ticker: TickerStateType,
	readonly tileSets: TileSetsState,
	readonly views: ViewsState,
};

const topGeorgist = combineReducers({
	accounts,
	serverConnection,
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
