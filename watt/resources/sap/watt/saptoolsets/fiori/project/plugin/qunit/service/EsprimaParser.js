define(function() {

	// JS object class
	var JSObject = function(objectName, aFunctionList) {
		this.objectName = objectName;
		if (aFunctionList && aFunctionList.length > 0) {
			this.aFunctionList = aFunctionList;
		} else {
			this.aFunctionList = [];
		}
	};

	JSObject.prototype.setName = function(sName) {
		this.objectName = sName;
	};

	JSObject.prototype.getFunctions = function() {
		return this.aFunctionList;
	};

	JSObject.prototype.setFunctions = function(JSFunction) {
		this.aFunctionList.push(JSFunction);
	};

	// JS function class
	var JSFunction = function(functionName, aFunctionParameters) {
		this.functionName = functionName;
		if (aFunctionParameters && aFunctionParameters.length > 0) {
			this.aFunctionParameters = aFunctionParameters;
		} else {
			this.aFunctionParameters = [];
		}

	};

	JSFunction.prototype.setFunctionParameter = function(paramName, defaultValue) {
		this.aFunctionParameters.push({
			paramerName: paramName,
			defaultValue: defaultValue
		});
	};

	JSFunction.prototype.getFunctionParameter = function() {
		return this.aFunctionParameters;
	};

	//------------------------Build Functions Tree------------------
	//check if currrent node is defined inside given scope
	function isInside(node, oScope) {
		var scopeNode = oScope.nodeFunction;
		if (node.range[0] >= scopeNode.range[0] && node.range[1] <= scopeNode.range[1]) {
			return true;
		} else {
			return false;
		}
	}

	//insert function into the wright place of the object of functions
	function insertFunc(node, oCurrScope) {
		if (oCurrScope.aInsideFuncs.length === 0) {
			oCurrScope.aInsideFuncs.push({
				nodeFunction: node,
				aInsideFuncs: []
			});
			return;
		}

		var lastFunc = oCurrScope.aInsideFuncs[oCurrScope.aInsideFuncs.length - 1];

		if (isInside(node, lastFunc)) {
			insertFunc(node, lastFunc);
		} else {
			oCurrScope.aInsideFuncs.push({
				nodeFunction: node,
				aInsideFuncs: []
			});
		}
	}

	function myJsVisitorBuild(node, context) {
		if (node.type === "FunctionDeclaration" || node.type === "FunctionExpression") {
			var oCurrScope = context;
			insertFunc(node, oCurrScope);
		}
		return true;
	}

	// build the object of functions according to the function depth level
	function buildFunctionsTree(tree, oAstService) {
		var oContext = {
			nodeFunction: null,
			aInsideFuncs: []
		};
		return oAstService.visit(tree, oContext, myJsVisitorBuild).then(function() {
			return oContext;
		});
	}

	//----------------------------Build Functions Tree End-------

	//--------------------------------Get parent Node-----------------------------
	//get parent node of the current node  
	function getParentNode(node, flatTree) {
		var indexFlat;
		for (var i = 0; i < flatTree.length; i++) {
			if (flatTree[i].range === node.range) {
				indexFlat = i;
				break;
			}
		}
		for (var j = indexFlat - 1; j >= 0; j--) {
			if (flatTree[j].range[0] <= node.range[0] && flatTree[j].range[1] >= node.range[1]) {
				return flatTree[j];
			}
		}
	}

	function myJsVisitorFlat(node, context) {
		context.push(node);
		return true;
	}

	//get tree that has been flatted according to visit order
	function getflatTree(tree, oAstService) {
		var aNodes = [];
		return oAstService.visit(tree, aNodes, myJsVisitorFlat).then(function() {
			return aNodes;
		});
		//mVisitor.visit(tree, aNodes, myJsVisitorFlat);
	}
	//-------------------------------- End Get parent Node-----------------------------

	//--------------AST helper functions-----------------------------------------------

	//cus.sd.sofulfil.monitor.model.DE05_Model = {};
	function getObjNameFromAssignment(node) {
		if (node.left.property) {
			var name = node.left.property.name;
		}
		var newobj = node.left.object;
		while (newobj && newobj.type === "MemberExpression") {
			name = newobj.property.name + "." + name;
			newobj = newobj.object;
		}
		if (newobj && newobj.type === "Identifier") {
			name = newobj.name + "." + name;
		}
		return name;
	}

	// checks whether function definition is inside caller expression
	function isAnonymusFunc(node, context) {
		var parent = getParentNode(node, context.aFlatTree);
		if (parent.type === "CallExpression") {
			//if(parent.type === "ExpressionStatement" || parent.type === "CallExpression"){
			return true;
		}
		return false;
	}

	//get list of valid functions for unitest (level 0 or level 1)
	function getValidFuncsList(context) {
		var aFuncObjects = [];
		//more than 1 func on first level
		if (context.oFuncsTree.aInsideFuncs.length > 1) {
			aFuncObjects = context.oFuncsTree.aInsideFuncs;
		}
		//one function on first level
		if (context.oFuncsTree.aInsideFuncs.length === 1) {
			var myFuncNode = context.oFuncsTree.aInsideFuncs[0].nodeFunction;

			if (myFuncNode.type === "FunctionExpression" && isAnonymusFunc(myFuncNode, context)) {
				aFuncObjects = context.oFuncsTree.aInsideFuncs[0].aInsideFuncs;
			} else {
				aFuncObjects = context.oFuncsTree.aInsideFuncs;
			}
		}
		return aFuncObjects;
	}

	//check if node inside valid functions for unitest
	function isValidFunc(node, aFunctions) {
		for (var i = 0; i < aFunctions.length; i++) {
			if (aFunctions[i].nodeFunction.range === node.range) {
				return true;
			}
		}
		return false;
	}
	//---------------------------End AST helper functions-----------------------------------------------

	//---------------------------Handle pattern behaviour------------------
	//handle functions as properties inside object definition
	function setObjectWithFunc(node, context) {
		if (node.properties) {
			var newObj = new JSObject();
			for (var i = 0; i < node.properties.length; i++) {
				var keynode = node.properties[i].key;
				var valuenode = node.properties[i].value;
				if (valuenode.type === "FunctionExpression") {
					//check of function node is on the right level (0 or 1) of functions tree
					if (isValidFunc(valuenode, context.aValidFunctions)) {
						var newFunc = new JSFunction(keynode.name, []);
						for (var j = 0; j < valuenode.params.length; j++) {
							newFunc.setFunctionParameter(valuenode.params[j].name, "");
						}
						newObj.setFunctions(newFunc);
					}
				}
			}

			var fatherNode = getParentNode(node, context.aFlatTree);
			var objName;

			// object in expression myController.extend("myFiori.view.Master", {foo:function(){}});
			if (fatherNode.type === "CallExpression") {
				if (fatherNode.arguments[0].value) {
					objName = fatherNode.arguments[0].value;
				}
			}

			//object in variable declaration e.g. var abc = {prop: function(){}};
			if (fatherNode.type === "VariableDeclarator") {
				objName = fatherNode.id.name;
			}

			//object is in assignment expression e.g.   aa.bb.bb = {prop: function(){}};
			if (fatherNode.type === "AssignmentExpression") {
				objName = getObjNameFromAssignment(fatherNode);
			}

			newObj.setName(objName);

			//there are functions as properties
			if (newObj.getFunctions().length > 0) {
				if (context.aObjectFunctions) {
					context.aObjectFunctions.push(newObj);
				} else {
					context.aObjectFunctions = [newObj];
				}
			}
		}
	}

	//function is declared independently. e.g. function foo(){}
	function setFunctionDeclaration(node, context) {
		if (isValidFunc(node, context.aValidFunctions)) {
			var jsFunction = new JSFunction(node.id.name, []);
			for (var i = 0; i < node.params.length; i++) {
				jsFunction.setFunctionParameter(node.params[i].name, "");
			}
			if (context.aFunctions) {
				context.aFunctions.push(jsFunction);
			} else {
				context.aFunctions = [jsFunction];
			}
		}
	}

	//function as variable declaration. e.g. var abc = function(){};
	function setFunctionVariableDeclaration(node, context) {
		if ((node.init) && node.init.type === "FunctionExpression") {
			//check if function is declared inside function which is objects property. Internal function is not for unit test
			//var isInternalFunc = isInternalFunction(node, context);
			if (isValidFunc(node.init, context.aValidFunctions)) {
				var jsFunction = new JSFunction(node.id.name, []);
				for (var i = 0; i < node.init.params.length; i++) {
					jsFunction.setFunctionParameter(node.init.params[i].name, "");
				}
				if (context.aFunctions) {
					context.aFunctions.push(jsFunction);
				} else {
					context.aFunctions = [jsFunction];
				}
			}
		}
	}

	//function as assignment.  e.g. cus.sd.sofulfil.monitor.utils.Commons.Utils.init = function(oController) {};
	function setFunctionAssignment(node, context) {
		if (isValidFunc(node.right, context.aValidFunctions)) {
			var funcName = getObjNameFromAssignment(node);
			var jsFunction = new JSFunction(funcName, []);

			for (var i = 0; i < node.right.params.length; i++) {
				jsFunction.setFunctionParameter(node.right.params[i].name, "");
			}
			if (context.aFunctions) {
				context.aFunctions.push(jsFunction);
			} else {
				context.aFunctions = [jsFunction];
			}
		}
	}

	function isConditionalNode(node) {
		if (node.type === "IfStatement" || node.type === "SwitchStatement" || node.type === "WhileStatement" || node.type === "DoWhileStatement" ||
			node.type === "ForStatement" || node.type === "ForInStatement") {
			return true;
		}
		return false;
	}

	function myJsVisitorIn(node, context) {

		//function is part of object property
		if (node.type === "ObjectExpression" && !context.bInCondition) {
			setObjectWithFunc(node, context);
		}
		//function is declared independently. e.g. function foo(){}
		if (node.type === "FunctionDeclaration" && !context.bInCondition) {
			setFunctionDeclaration(node, context);
		}
		//function as variable declaration. e.g. var abc = function(){};
		if (node.type === "VariableDeclarator" && !context.bInCondition) {
			setFunctionVariableDeclaration(node, context);
		}
		//function is part of assignment expression e.g. cus.sd.sofulfil.monitor.utils.Commons.Utils.resetFooterContentRightWidth = function(oController) {};
		if (node.type === "AssignmentExpression" && node.right.type === "FunctionExpression" && !context.bInCondition) {
			setFunctionAssignment(node, context);
		}
		if (isConditionalNode(node)) {
			if (context.bInCondition === false) {
				context.oConditionNode = node;
				context.bInCondition = true;
			}
		}
		return true;
	}

	function myJsVisitorOut(node, context) {
		if (node === context.oConditionNode) {
			context.bInCondition = false;
			context.oConditionNode = null;
		}
	}
	//---------------------------End Handle pattern behaviour------------------

	// ParsedContext  - returned object
	var ParsedContext = {

		parse: function(sContent) {
		    
            var oAstService = this.context.service.jsASTManager;
			
			var extraOptions = {
				range: true,
				tolerant: true,
				comment: true
			};

			return oAstService.parse(sContent, extraOptions).then(function(mytree) {

				return buildFunctionsTree(mytree, oAstService).then(function(myFuncTree) {

					return getflatTree(mytree, oAstService).then(function(myFlatTree) {

						var context = {
							aObjectFunctions: [],
							aFunctions: [],
							aFlatTree: myFlatTree,
							oFuncsTree: myFuncTree,
							aValidFunctions: [],
							oConditionNode: null,
							bInCondition: false
						};

						context.aValidFunctions = getValidFuncsList(context);

						return oAstService.visit(mytree, context, myJsVisitorIn, myJsVisitorOut).then(function() {
							var result = {};
							result.getFunctions = function() {
								return context.aFunctions;
							};
							result.getObjects = function() {
								return context.aObjectFunctions;
							};
							return result;
						});
					});
				});
			});
		}
		
		
	};
	
	return ParsedContext;
});