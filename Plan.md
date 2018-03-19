# Plan for Top Georgist

## ToDo milestone 1.

* Autopack with webpack.
* Itch.io page
	* Butler push
* Open up in browser
* Has a player
	* Player can move around
	* Player has property "money"
		* Player can spend money.
	* Player has property "calories"
		* Calories drop all the time.
	* Player has inventory.
* Has a map
	* Store
		* Buys food
		* Sells food
		* Has property "money"
		* Has limited inventory
	* Plots
		* Player can plant shoots
		* Shoots grow into food
		* It takes time for shoots to grow into food.
		* Food can be collected by players, removing the seed.
* Items
	* Money
	* Shoots
		* Can be planted
	* Food
		* Can be eaten to increase calories
		* Can be turned into 2 shoots.

## Milestone 2

* Refactor view.
* tgoId generation.
	* uuid npm package installed.
* Player creation.
* redux store array accessor shorthand functions / utility.
* Multiplayer
	* Receiving the map
	* Receiving tgos
		* Move function from tgos to types.
* Map
	* Seeded generation.
* Leaderboards
* Buildings
	* Rent office
		* Used to reserve land
		* Used to pay rent
	* Government building
		* Player spawns here
		* Has an account for each player
		* Player can collect money in account.
		* Accounts gets equal % of all rent collected from rent office.
* Tick into redux.
* Reduxise all callbacks.

## Milestone 3
* Time sinks
	* Doing most actions should require ticks to complete.
	* Most actions can be paused
* UI progress bar.
	* Segmented by ticks, but progress 0 -> 1 is linear in progress bar
	* Above means that for most tasks, the start parts take long time and don't produce much, but later parts take less time and produce more.
* Farming overhaul
	* Progress can be seen
	* Pineapples grow edible, but calories doesn't increase after certain point.
* UI mouse selection of positions
* Economy
	* More sinks
* Player
	* New "energy" stat.
	* Doing different actions use "energy"
	* Calorie burn regenerates energy.
	* Can sleep
		* Can be done anywhere.
		* Regenerates energy
		* Sleeping in a bed regenerates more energy.
* Buildings
	* Barracks
		* Has beds that cost to use
* Rendering overhaul
* Add graphics for most items.
* Better map generation.
* Rehydrate
* Hot reload?
* Publishing
* Investigate
	* redux-loop https://github.com/redux-loop/redux-loop
	* reducer-reducer?
	* Need for redux-thunk?
* Server hosting.
	* Where?

## Icebox

* Investigate
	* react?, react-native with -web?
