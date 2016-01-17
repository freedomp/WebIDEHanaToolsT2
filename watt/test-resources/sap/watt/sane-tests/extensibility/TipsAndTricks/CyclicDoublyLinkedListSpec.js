define(["sap/watt/platform/plugin/tipsandtricks/datastructures/CyclicDoublyLinkedList"], function(CyclicDoublyLinkedList) {

	describe("The CyclicDoubliLinkedList", function() {
		it("has a constructor without arguments", function() {
			var linkedList = new CyclicDoublyLinkedList();
			expect(linkedList).to.be.ok;
		});

		it("has null in _currentNode, _firstNode, _lastNode when created empty", function() {
			var linkedList = new CyclicDoublyLinkedList();
			expect(linkedList).to.be.ok;
			expect(linkedList._currentNode).to.be.null;
			expect(linkedList._firstNode).to.be.null;
			expect(linkedList._lastNode).to.be.null;
		});

		it("can add a single element to an empty list", function() {
			var linkedList = new CyclicDoublyLinkedList();
			expect(linkedList).to.be.ok;

			var firstNode = {name:"Obama", age:55};
			linkedList.add(firstNode);
			expect(linkedList._currentNode.data).to.deep.equal(firstNode);
			expect(linkedList._firstNode.data).to.deep.equal(firstNode);
			expect(linkedList._lastNode.data).to.deep.equal(firstNode);
			expect(linkedList.getCurrent().data).to.deep.equal(firstNode);
		});

		it("throws an error if next is called on an empty list", function() {
			var linkedList = new CyclicDoublyLinkedList();
			expect(linkedList).to.be.ok;

			expect(linkedList.next).to.throw("Cannot change the current item of an empty list to point to the next item");
		});

		it("throws an error if previous is called on an empty list", function() {
			var linkedList = new CyclicDoublyLinkedList();
			expect(linkedList).to.be.ok;

			expect(linkedList.previous).to.throw("Cannot change the current item of an empty list to point to the previous item");
		});

		it("can add a multiple elements to an empty list", function() {
			var linkedList = new CyclicDoublyLinkedList();
			expect(linkedList).to.be.ok;

			var firstNode = {index:1, name:"Obama", age:55};
			var secondNode = {index:2, name:"Clinton", age:44};
			var thirdNode = {index:3, name:"Bernie", age:50};
			linkedList.add(firstNode);
			linkedList.add(secondNode);
			linkedList.add(thirdNode);

			expect(linkedList.getCurrent().data).to.deep.equal(firstNode);
			expect(linkedList.getCurrent().previous.data).to.deep.equal(thirdNode);
			expect(linkedList.getCurrent().next.data).to.deep.equal(secondNode);
			expect(linkedList.getCurrent().next.next.data).to.deep.equal(thirdNode);
			expect(linkedList.getCurrent().next.next.next.data).to.deep.equal(firstNode);
		});

		it("can create a list from array", function() {
			var firstNode = {index:1, name:"Obama", age:55};
			var secondNode = {index:2, name:"Clinton", age:44};
			var thirdNode = {index:3, name:"Bernie", age:50};

			var linkedList = new CyclicDoublyLinkedList([firstNode, secondNode, thirdNode]);
			expect(linkedList).to.be.ok;

			expect(linkedList.getCurrent().data).to.deep.equal(firstNode);
			expect(linkedList.getCurrent().previous.data).to.deep.equal(thirdNode);
			expect(linkedList.getCurrent().next.data).to.deep.equal(secondNode);
			expect(linkedList.getCurrent().next.next.data).to.deep.equal(thirdNode);
			expect(linkedList.getCurrent().next.next.next.data).to.deep.equal(firstNode);
		});

		it("has a next() method that changes the state of the list", function() {
			var firstNode = {index:1, name:"Obama", age:55};
			var secondNode = {index:2, name:"Clinton", age:44};
			var thirdNode = {index:3, name:"Bernie", age:50};

			var linkedList = new CyclicDoublyLinkedList([firstNode, secondNode, thirdNode]);

			var oldCurrent = linkedList.getCurrent();
			linkedList.next();
			expect(linkedList.getCurrent()).to.deep.equal(oldCurrent.next);
		});

		it("has a previous() method that changes the state of the list", function() {
			var firstNode = {index:1, name:"Obama", age:55};
			var secondNode = {index:2, name:"Clinton", age:44};
			var thirdNode = {index:3, name:"Bernie", age:50};

			var linkedList = new CyclicDoublyLinkedList([firstNode, secondNode, thirdNode]);

			var oldCurrent = linkedList.getCurrent();
			linkedList.previous();
			expect(linkedList.getCurrent()).to.deep.equal(oldCurrent.previous);
		});
	});

});

