define([], function() {
	"use strict";

	return {
		configure: function(mConfig) {},

		_generateFunctionCommentString: function(nodeInfo, delimiter) {
			//TODO: move to template + OS dependent newlines chars?
			var commentColCount = nodeInfo.commentLoc.start.column;
			var spaces = ""; //this._getSpaces(commentColCount);
			var newlineDelimeter = delimiter || "\n";
			var comment = "/** "; //+ nodeInfo.name;
			comment += newlineDelimeter + spaces + " * "; //empty line for description
			comment += this._isConstructorFunction(nodeInfo.name) ? (newlineDelimeter + spaces + " * @constructor ") : "";
			var params = nodeInfo.params;
			for (var i = 0; i < params.length; i++) {
				comment += (newlineDelimeter + spaces + " * @param " + params[i].name);
			}
			if (nodeInfo.returns && nodeInfo.returns.length > 0) {
				comment += (newlineDelimeter + spaces + " * @returns");
			}
			comment += (newlineDelimeter + spaces + " */");//end of comment
			comment += (newlineDelimeter + spaces);//re-indent the documented function
			return comment;
		},
		_isConstructorFunction: function(name) {
			if (!name) {
				return false;
			}
			var firstLetter = name.charAt(0);
			return firstLetter.toUpperCase() === firstLetter;
		},
		_getSpaces: function(num) {
			var spaces = "";
			for (var j = 0; j < num - 1; j++) {
				spaces += " ";
			}
			return spaces;
		},
		_insertInString: function(str, index, value) {
			return str.substr(0, index) + value + str.substr(index);
		},

		_logWarning: function(msg) {
			this.context.service.log.warn(this.context.service.jsdocgen.getProxyMetadata().getName(), msg, ["user"])
				.done();
		},
		generateComment: function(nodeInfo, document, delimiter) {
			if (!nodeInfo || !nodeInfo.node || !document) {
				this._logWarning("invalid input");
				return Q();
			}

			var comment = this._generateFunctionCommentString(nodeInfo, delimiter);
			return comment;
			/*var that = this;
			return document.getContent().then(function(content) {
				var newContent = that._insertInString(content, nodeInfo.commentOffset, comment);
				return document.setContent(newContent);
			});*/
		},

		_findVisitor: function(node, visitContext) {
			switch (node.type) {
				case "FunctionDeclaration":
					if (visitContext.nodeInfo.node) {
						return false; //no need to continue traveling
					}
					//the cursor is in the range of runction decleration e.g anywhere in function abc(a,b,c) 
					//this is the function then stop visit
					if (visitContext.offset > node.range[0] && visitContext.offset < node.body.range[0]) {
						visitContext.nodeInfo.node = node;
						visitContext.nodeInfo.name = node.id.name;
						visitContext.nodeInfo.params = node.params;
						visitContext.nodeInfo.commentLoc = node.loc;
						visitContext.nodeInfo.commentOffset = node.range[0];
					}
					return true;
				case "VariableDeclarator":
					if (visitContext.node) {
						return false; //no need to continue traveling
					}
					var declarator = node;
					if (declarator.init && declarator.init.type === "FunctionExpression") {
						//the cursor is in the range of runction decleration e.g anywhere in function abc(a,b,c) 
						//this is the function then stop visit
						if (visitContext.offset > declarator.init.range[0] && visitContext.offset < declarator.init.body.range[0]) {
							visitContext.nodeInfo.node = declarator.init;
							visitContext.nodeInfo.name = declarator.id.name;
							visitContext.nodeInfo.params = declarator.init.params;
							visitContext.nodeInfo.commentLoc = declarator.id.loc;
							visitContext.nodeInfo.commentOffset = declarator.id.range[0];
						}
					}
					return true;
				case "Property":
					if (visitContext.node) {
						return false; //no need to continue traveling
					}
					var property = node;
					if (property.value && property.value.type === "FunctionExpression") {
						//the cursor is in the range of runction decleration e.g anywhere in function abc(a,b,c) 
						//this is the function then stop visit
						if (visitContext.offset > property.value.range[0] && visitContext.offset < property.value.body.range[0]) {
							visitContext.nodeInfo.node = property.value;
							visitContext.nodeInfo.name = property.key.name;
							visitContext.nodeInfo.params = property.value.params;
							visitContext.nodeInfo.commentLoc = property.key.loc;
							visitContext.nodeInfo.commentOffset = property.key.range[0];
						}
					}
					return true;
				case "ReturnStatement":
					if (visitContext.endNode) {
						return false;
					}
					if (visitContext.nodeInfo.node) {
						visitContext.nodeInfo.returns.push(node);
					}
					return true;
				default:
					return !visitContext.endNode;
			}
		},

		_postVisit: function(node, visitContext) {
			switch (node.type) {
				case "FunctionDeclaration":
				case "FunctionExpression":
					if (visitContext.nodeInfo.node === node) {
						visitContext.endNode = true;
					}
					break;
				default:
			}
		},

		_ParseOptions: {
			range: true,
			loc: true,
			tolerant: false
		},

		findDefinition: function(oContentStatus) {
			if (!oContentStatus) {
				this.context.service.log.warn(this.context.service.jsdocgen.getProxyMetadata().getName(), "could not get content from editor", ["user"])
					.done();
				return Q();
			}

			var astService = this.context.service.jsASTManager;
			var visitContext = {
				offset: oContentStatus.offset,
				nodeInfo: {
					node: null,
					returns: []
				}
			};
			var that = this;
			return astService.parseAndVisit(oContentStatus.targetFile, oContentStatus.buffer, this._ParseOptions, visitContext, this._findVisitor,
				this._postVisit).then(function(result) {
				return result.outlineContext.nodeInfo;
			}).fail(function(err) {
				that.context.service.log.warn(that.context.service.jsdocgen.getProxyMetadata().getName(), err, ["user"]).done();
			});

		}

	};
});