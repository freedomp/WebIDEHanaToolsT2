define(function() {
	var depthFirstTraversal = function(o, fn) {
		if (typeof o == "object") {
			for ( var attr in o) {
				if (typeof o[attr] == "object") {
					depthFirstTraversal(o[attr], fn);
				}
			}
		}
		fn.call(null, o);
	};

	/*
	 *returns the first encountered node  by typeName
	 */
	var _getNodeByType = function(root, typeName) {
		var result;

		depthFirstTraversal(root, function(node) {
			if (node.type == typeName && result === undefined) {

				//handle the known node
				result = node;
			}
		});

		return result;
	};

	/*
	 *returns the first encountered node  by nodeName
	 */
	var _getNodeByName = function(root, nodeName) {
		var result;

		depthFirstTraversal(root, function(node) {
			if (node.name == nodeName && result === undefined) {

				//handle the known node
				result = node;
			}
		});

		return result;
	};

	/*
	 *returns all encountered nodes by nodeName
	 */
	var _getNodesByName = function(root, nodeName) {
		var result = [];

		depthFirstTraversal(root, function(node) {
			if (node.name == nodeName) {

				//handle the known node
				result.push(node);
			}
		});

		return result;
	};

	/*
	 *returns all encountered nodes by typeName
	 */
	var _getNodesByType = function(root, typeName) {
		var result = [];

		depthFirstTraversal(root, function(node) {
			if (node.type == typeName) {

				//handle the known node
				result.push(node);
			}
		});

		return result;
	};

	return {
		getNodeByType : _getNodeByType,
		getNodesByType : _getNodesByType,
		getNodeByName : _getNodeByName,
		getNodesByName : _getNodesByName
	};
});
