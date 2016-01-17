define([ './SchemaMetadata' ], function(mSchemaMetadata) {
    /*global window, DOMParser, ActiveXObject*/
	var SchemaMetadataContentAssist = function() {
		this.mSchemaMetadata = mSchemaMetadata;
		this.schemaList = [];
	};
	SchemaMetadataContentAssist.prototype = {
		init : function(schemas, schemaInfo, targetFile, pcontext) {
		    var i;
			this.schemaList = [];
			this.targetFile = targetFile;
			this.context = pcontext;
			this._oFileService = this.context.service.filesystem.documentProvider;
			if (!schemas) {
				for (i = 0; i < schemaInfo.length; i++) {
					this.schemaList.push({
						ns : schemaInfo[i].ns,
						loc : schemaInfo[i].loc
					});
				}
			} else {
				for (i = 0; i < schemas.length; i++) {
					this.schemaList.push({
						ns : schemas[i].ns,
						loc : schemas[i].loc,
						xmlContent : schemas[i].xmlContent
					});
				}
			}

			var oDeferred = Q.defer();
			this.processSchemas(this.schemaList).then(function(ret) {
				oDeferred.resolve(ret);
			});
			return oDeferred.promise;
		},

		candidateElements : function(env) {
			var hintText = env.prefix;
			var contextNamespace = env.ns;
			var contextParent = env.parent;
			var elements = [];

			var pDoc = null;
			var pnode = null;
			var pns = contextParent.ns;
			var pname = contextParent.name;

			for (var i = 0; i < this.schemaList.length; i++) {
				if (pns == this.schemaList[i].ns) {
					pnode = this.getNode(this.schemaList[i].xmlDoc, pns, pname);
					if (pnode) {
						pDoc = this.schemaList[i].xmlDoc;
						break;
					}
				}
			}
			if (pnode) {
				var cnodes = this.getChildNodes(this.schemaList, pDoc, pnode, contextNamespace);
				for (var j = 0; j < cnodes.length; j++) {
					var cdesc = "";
					var cname = cnodes[j].name;
					var ctype = "Element";
					if (this.compareStringIgnoreCase(cname.substr(0, hintText.length), hintText)) {
						elements.push({
							"name" : cname,
							"type" : ctype,
							"description" : cdesc,
							"fullName" : cname
						});
					}
				}
			}
			return elements;
		},

		candidateAttributes : function(env) {
			var hintText = env.prefix;
			var contextNamespace = env.ns;
			var contextControl = env.element;
			var contextAttributes = env.attrs;
			var attributes = [];

			var cDoc = null;
			var enode = null;
			var ens = contextControl.ns;
			var ename = contextControl.name;
			for (var i = 0; i < this.schemaList.length; i++) {
				if (ens == this.schemaList[i].ns) {
					enode = this.getNode(this.schemaList[i].xmlDoc, ens, ename);
					if (enode) {
						cDoc = this.schemaList[i].xmlDoc;
						break;
					}
				}
			}
			if (enode) {
				var attrs = this.getAttributes(this.schemaList, cDoc, enode, contextNamespace);
				for (var j = 0; j < attrs.length; j++) {
					var adesc = "";
					var aname = attrs[j].name;
					var atype = "Property";
					var adtype = attrs[j].dType;
					var isEnum = (attrs[j].enumOptions && attrs[j].enumOptions.length > 0) ? true : false;
					if (this.compareStringIgnoreCase(aname.substr(0, hintText.length), hintText)) {
						attributes.push({
							"name" : aname,
							"type" : atype,
							"dataType" : adtype,
							"description" : adesc,
							"fullName" : aname,
							"isEnum" : isEnum
						});
					}
				}
			}
			return attributes;
		},

		candidateAttributeValues : function(env) {
			var hintText = env.prefix;
			var contextNamespace = env.ns;
			var contextControl = env.element;
			var contextAttribute = env.attr;
			var result = [];

			var cDoc = null;
			var anode = null;
			var ans = contextAttribute.ns;
			var aname = contextAttribute.name;
			anode = this.getAttrNode(this.schemaList, ans, aname);

			if (anode) {
				var attrInfo = this.getAttrInfo(this.schemaList, ans, anode);
				if (attrInfo) {
					var len = hintText.length;
					if (attrInfo.dType == "xs:boolean") {
						if (len > 0) {
							if (this.compareStringIgnoreCase("false".substr(0, len), hintText)) {
								result.push({
									name : "false",
									type : "boolean",
									"fullName" : attrInfo.name
								});
							}

							if (this.compareStringIgnoreCase("true".substr(0, len), hintText)) {
								result.push({
									name : "true",
									type : "boolean",
									"fullName" : attrInfo.name
								});
							}
						} else {
							result.push({
								name : "false",
								type : "boolean",
								"fullName" : attrInfo.name
							});
							result.push({
								name : "true",
								type : "boolean",
								"fullName" : attrInfo.name
							});
						}
					} else if (attrInfo.enumOptions) {
						var val = null;
						if (len > 0) {
							for (var i = 0; i < attrInfo.enumOptions.length; i++) {
								val = attrInfo.enumOptions[i];
								if (this.compareStringIgnoreCase(val.substr(0, len), hintText)) {
									result.push({
										name : val.toString(),
										type : "enum",
										"description" : val,
										"fullName" : val
									});
								}
							}
						} else {
							for (var i = 0; i < attrInfo.enumOptions.length; i++) {
								val = attrInfo.enumOptions[i];
								result.push({
									name : val.toString(),
									type : "enum",
									"description" : val,
									"fullName" : val
								});
							}
						}
					}
				}
			}

			return result;
		},

		/*
			private functions
		*/
		getSchemaDom : function(content) {
			try {
				var parser = null;
				var xmlDoc;
				if (window.ActiveXObject) { //code for IE
					parser = new ActiveXObject("Microsoft.XMLDOM");
					parser.async = false;
					xmlDoc = parser.loadXML(content);
				} else if (window.DOMParser) { //code for Chrome, Safari, Firefox, Opera, etc.
					parser = new DOMParser();
					xmlDoc = parser.parseFromString(content, "text/xml");
				} else {
					xmlDoc = null;
				}
			} catch (e) {
				console.log(e);
			}
			return xmlDoc;
		},

		getSchemaUrlContent : function(fileObj) {
			var that = this;
			var url = fileObj.loc;
			var oDeferred = Q.defer();
			$.ajax({
				url : url,
				dataType : 'text',
				async : false,
				success : function(response, textStatus, xhr) {
					var content = response;
					fileObj.xmlContent = content;
					fileObj.xmlDoc = that.getSchemaDom(content);
					oDeferred.resolve(content);
				},
				error : function(xhr, textStatus, error) {
					//xhr ? xhr.status + " - " + xhr.statusText : textStatus;
					oDeferred.resolve(null);
				}
			});
			return oDeferred.promise;
		},
		getSchemaFileContent : function(fileObj) {
			var that = this;
			var oDeferred = Q.defer();
			var absPath = this.targetFile.slice(0, this.targetFile.lastIndexOf("/") + 1) + fileObj.loc;
			if (fileObj.loc.indexOf("/") == 0) {
				absPath = fileObj.loc;
			}
			this._oFileService.getDocument(absPath).then(function(fileDocument) {
				if (fileDocument) {
					//file exists, read
					fileDocument.getContent().then(function(oContent) { //that._oFileService.readFileContent(fileDocument).then(function(oContent) {
						var content = oContent;
						fileObj.xmlContent = content;
						fileObj.xmlDoc = that.getSchemaDom(content);
						oDeferred.resolve(content);
					}, function(error_read) {
						oDeferred.resolve(null);
					});
				} else {
					oDeferred.resolve(null);
				}
			}, function(error_get_xsd_file) {
				oDeferred.resolve(null);
			});

			return oDeferred.promise;
		},
		processSchemas : function(schemaList) {
			var that = this;
			var promises = [];
			for (var i = 0; i < schemaList.length; i++) {
				if (!schemaList[i].xmlDoc) {
					if (schemaList[i].xmlContent) {
						schemaList[i].xmlDoc = that.getSchemaDom(schemaList[i].xmlContent);
					} else if (schemaList[i].loc.indexOf("http:") == 0 || schemaList[i].loc.indexOf("https:") == 0) {
						promises.push(this.getSchemaUrlContent(schemaList[i]));
					} else {
						promises.push(this.getSchemaFileContent(schemaList[i]));
					}
				}
			}
			return Q.all(promises).then(function(xmlcontent) {
				//done		
				return true;
			});
		},

		getNode : function(pDoc, ns, name) {
			var sDoc = mSchemaMetadata.util.getSchemaNode(pDoc, ns);
			var node = mSchemaMetadata.util.getNode(sDoc, ns, name);
			return node;
		},

		getChildNodes : function(schemaList, pDoc, pNode, cns) {
			var cnodes = [];
			cnodes = mSchemaMetadata.util.getChildNodes(schemaList, pNode, cns);
			return cnodes;
		},

		getAttributes : function(schemaList, cDoc, cNode, cns) {
			var attrs = [];
			attrs = mSchemaMetadata.util.getAttributes(schemaList, cNode, cns);
			return attrs;
		},

		getAttrNode : function(schemaList, ans, aname) {
			var anode = null;
			anode = mSchemaMetadata.util.getAttrNode(schemaList, ans, aname);
			return anode;
		},

		getAttrInfo : function(schemaList, ans, aNode) {
			var nodeInfo = null;
			nodeInfo = mSchemaMetadata.util.getAttrInfo(schemaList, ans, aNode);
			return nodeInfo;
		},

		compareStringIgnoreCase : function(str1, str2) {
			return str1.toLowerCase() === str2.toLowerCase();
		}
	};

	return SchemaMetadataContentAssist;
});
