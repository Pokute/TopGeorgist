# Plan for Top Georgist

## ToDo milestone 1.

* Autopack with webpack.
* Itch.io page with publish
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
		* Sells seeds
		* Has property "money"
		* Has limited inventory
	* Rent office
		* Used to reserve land
		* Used to pay rent
	* Government building
		* Player spawns here
		* Has an account for each player
		* Player can collect money in account.
		* Accounts gets equal % of all rent collected from rent office.
	* Plots
		* Player can plant seeds
		* Seeds grow into food after some time.
		* Food can be collected by players, removing the seed.
* Items
	* Money
	* Seeds
		* Can be planted
	* Food
		* Can be eaten to increase calories
		* Can be turned into 2 seeds.

## Milestone 2

* Hot reload?
* Player
	* New "energy" stat.
	* Doing different actions use "energy"
	* Calorie burn regenerates energy.
	* Can sleep
		* Can be done anywhere.
		* Regenerates energy
		* Sleeping in a bed regenerates more energy.
* Barracks
	* Has beds that cost to use
* Investigate
	* redux-loop https://github.com/redux-loop/redux-loop
	* reducer-reducer?
	* Need for redux-thunk?
	* react?, react-native with -web?
