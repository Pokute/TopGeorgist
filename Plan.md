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
	* Server hosting.
		* Where?
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
* Rehydrate
* Hot reload?
* Investigate
	* redux-loop https://github.com/redux-loop/redux-loop
	* reducer-reducer?
	* Need for redux-thunk?
* Tick into redux.
* Reduxise all callbacks.
* Publishing

## Milestone 3
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
* Investigate
	* react?, react-native with -web?
* Rendering overhaul
* Add graphics for most items.
* Better map generation.
* Economy
	* More sinks
