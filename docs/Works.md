# How works work.

Work is the process of production and should be used for almost anything from harvesting crops, buying items, moving around, participating in elections and even basic metabolism. Recipes are the blueprints of production and works are the ongoing process. A work has one designated worker, but can get inputs from multiple inventories and has one output inventory.

## What's what.

`ComponentWork`: A tgo, usually contained in a `workDoer`'s inventory. Check with `isComponentWork()`. Is also a `ComponentWorkIssuer` since it can create subworks.
`ComponentWorkDoer`: A tgo that can process Works residing in his inventory. Check with `hasComponentWorkDoer`. Is also a `ComponentWorkIssuer`.
`ComponentWorkIssuer`: A tgo that can create new Works for `workDoer`s. All `workDoer`s are also `workIssuer`s. Check with `hasComponentWorkIssuer`.
`ComponentGoal`: A goal. Is also a `ComponentWorkIssuer` since it can create subworks.

## The logic in high level.

### Creation

Usually `createWork` action is called with following parameters:
	* The recipe
	* The workDoer
	* Input inventories.
	* (optional) Output inventory. If no output is defined, uses a temporary committedItems inventory.
	* (optional) The workIssuer, defaults to the workDoer.

### Initialisation

* A work tgo is created and inserted in WorkDoer's inventory.
* For workIssuer, the work tgo is added to worksIssued array. The work has a workIssuerTgoId that points to the workIssuer.
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
	* Make a transaction of items from input inventory into committedItems inventory.
		* If `tick`'s are required, one is added from `tickSourceDummyTgoId`.
	* Commit the transaction.
* If still missing items
	* Find applicable recipes for the workDoer that could provide the missing items.
* If missing item count is zero
	* Create transaction for adding the `output` to `target` inventory.
	* Commit the transaction.

### Cancelling

Cancelling repays the committed items to their source inventories and removes all work item and associated temp inventories.
If source inventories no longer exist, the items are transported to workDoer's inventory or workIssuer's inventory. In the end, workDoer should always exist.

### Finalizing

When the work completes, the work tgo and all it's related inventories are deleted (usually).

## Current big issue.

* Current big painpoint:
* * When a work creates a subwork, the inventory tracking is all messed up.
* * * Having the subwork put created items in workDoer's inventory is not elegant.
* * * Same for even work like 'move', where movementAmount, where isStorable shoud be false, but can't be since we store it in player's inventory.
* * Solution would be that by default, works should input temporary items in their own inventory.
* * When multiple things require some resource, there could be two different works created for producing that resource, but it one produces that resource, it's practically up to chance which requirer snatches that resource up first.

*SubWork's output is instead deposited directly into parentWork's committedItems. This also works as a kind of inventory.
Side effects items don't work for that really, so these would need a separate mechanism.

On work cancellation/completion, redeems/surplus/sideoutputs could be moved upward either to the issuer's inventory or workDoer's inventory...

## Limitations.

* Having `tick`'s in the output doesn't do anything useful, but could be used to distribute the `output` during multiple `tick`s.
* For some recipes, like a public workshop or a quarry, there's no way to earmark certain produced items to a `workDoer`.

## Work transferability.

Work must be inside WorkDoer's inventory for any work to progress. However, in-progress work can be transferred to another inventory, but it might not continue inside that other inventory.

## Other improvements under consideration.

* Priorities would be fine.

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
