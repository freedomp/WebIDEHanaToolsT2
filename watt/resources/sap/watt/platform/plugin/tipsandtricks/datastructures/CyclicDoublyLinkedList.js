define([], function() {
	var CyclicDoublyLinkedList = function(array) {
		if(array === undefined) {
			array = [];
		}

		this._currentNode = null;
		this._firstNode = null;
		this._lastNode = null;

		for(var index = 0 ; index < array.length ; index++) {
			this.add(array[index]);
		}
	};

	CyclicDoublyLinkedList.prototype.next = function() {
		if(!this._currentNode) {
			throw new Error("Cannot change the current item of an empty list to point to the next item");
		}
		this._currentNode = this._currentNode.next;
		return this._currentNode;
	};

	CyclicDoublyLinkedList.prototype.previous = function() {
		if(!this._currentNode) {
			throw new Error("Cannot change the current item of an empty list to point to the previous item");
		}
		this._currentNode = this._currentNode.previous;
		return this._currentNode;
	};

	CyclicDoublyLinkedList.prototype.add = function(data) {
		//If this is the first node we add
		if(!this._firstNode) {
			this._firstNode = {
				data: data,
				next: null,
				previous: null
			};
			this._firstNode.next = this._firstNode;
			this._firstNode.previous = this._firstNode;

			this._lastNode = this._firstNode;
			this._currentNode = this._firstNode;

			return;
		}

		this._lastNode.next = {
			data: data,
			next: this._firstNode,
			previous: this._lastNode
		};

		this._lastNode = this._lastNode.next;

		this._firstNode.previous = this._lastNode;
	};

	CyclicDoublyLinkedList.prototype.getCurrent = function() {
		return this._currentNode;
	};

	//TODO consider adding a remove method!

	return CyclicDoublyLinkedList;
});