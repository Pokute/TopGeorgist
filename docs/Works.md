# How works work.

Work is the process of production and should be used for almost anything from harvesting crops, buying items, moving around, participating in elections and even basic metabolism. Recipes are the blueprints of production and works are the ongoing process. Work can have two(?) participants, the active worker and the passive target.

## What's what.

`ComponentWork`: A tgo, usually contained in someone's inventory. Check with `isComponentWork()`.
`ComponentWorkDoer`: A tgo that can process Works residing in his inventory.Check with `hasComponentWorkDoer`.

## The logic in high level.

### Creation

Usually `createWork` action is called with following parameters:
	* The recipe
	* The workdoer
	* Input inventories.
	* Output inventory.

### Initialisation

* A work tgo is created and inserted in WorkDoer's inventory.
* If needed, temporary tgo's for virtual inventories are created.
	* For each committer, a separate virtual inventory is created.
	* That virtual inventory tracks committed items.
	* On work calcellation, the items in virtual inventory are given back.

### Ticking

This is run every tick.

* First we calculate all the items that are needed, the `input` to fulfill the requirements and their item info.
* Then we find the committedItems inventories to see all the items committed by both the worker and the target.
* We subtract committed items from required items to find the missing item count.
* If missing items still remain
	* (Should work like this) Allocate required items from target inventory
	* (Should work like this) Allocate rest of required items from workDoer inventory.
	* Create a transaction based on allocated items
		* If `tick`'s are required, one is added from `tickSourceDummyTgoId`.
	* Commit the transaction
* If missing item count is zero
	* Create transaction for adding the `output` to `target` inventory.
	* Commit the transaction.

### Cancelling

Cancelling could still work, but isn't implemented right now. For this we would repay the items to their source inventories ()

### Finalizing

When the work completes, the work tgo and all it's related inventories are deleted (usually).

## Current bugs.

* If both the `workDoer` and `target` inventories have required `input` items, double-commit might happen.
* For some recipes, we would likely want to have `input` from both `workDoer` and `target`, but would like the `output` go into `workDoer`'s inventory. This is currently not possible.

## Limitations.

* It seems that having a recipe that consumes and produces same item would not work properly.
* Having `tick`'s in the output doesn't do anything useful, but could be used to distribute the `output` during multiple `tick`s.
* For some recipes, like a public workshop or a quarry, there's no way to earmark certain produced items to a `workDoer`.

## Work transferability.

Work must be inside WorkDoer's inventory for any work to progress. However, in-progress work can be transferred to another inventory, but it might not continue inside that other inventory.

## Unsorted bullet points.

Work is an application of recipe. Work is always done by a single Tgo.
Works must be inside inventories.
Works inside inventories of ComponentWorkDoer are processed each tick.

## Other improvements under consideration.

* Having both the workDoer and target seems like a requirement I can't ignore.
	* It might be better to have unlimited amount of `input` inventories and one `output` inventory.
	* Priorities would work.

## Possibility: Three different kinds of works.

* Some works are immediate and don't require their own inventory:
	* Req: Their recipe have at most one tangible & continous input&output item.
	* Req: Their recipe never take longer than one tick.
	* THINK: Do these still need an inventory, since inputing all different items/work at the same time is difficult? - Prolly yeah.
	* THINK: These works should probably performed by separate, specialised tgos.
	* Examples:
		* Planning, thinking, dexterity, precision, lower body strength, upper body strength works.
		* Convert hydrocarbons to energy.
* Other works have their own inventory:
	* Either:
		* Req: Their recipe has multiple tangible inputs so these might "buffer" to internal inventory.
		* Req: Their recipe requires multiple ticks.
	* Items inputed might be refunded.
	* Examples:
		* Long thinking process, like deciding where to shop.
		* Eating, requires time, inventory items and skills.
* Some works are actually in inventories of world items which are not ComponentWorkDoer:
	* Examples:
		* Constructions site for buildings.
			* Q: How is completion handled. What replaces the construction site with the building?
	* Q: Sounds like prime candidate for contract. This could have multiple contributors?
* Unresolved cases:
	* Furnishing a house
		* Either dummy world item or just ComponentWork with ComponentPosition.
	* Prospecting an area for ores.
		* Either dummy world item (Prospecting marker) or just ComponentWork with ComponentPosition.
	* Repairing a screwdriver.
		* Maybe work is inside screwdriver's inventory or placed within the WorkDoer's (repairman) inventory?
