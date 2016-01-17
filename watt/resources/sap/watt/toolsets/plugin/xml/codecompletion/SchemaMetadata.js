define(function () {
	var util = {};
 
    var getAttribute = function (node, localName, nsURI) {

        var attributes = node.attributes;
        if (attributes.getNamedItemNS) {
            return attributes.getNamedItemNS(nsURI || null, localName);
        }

        return attributes.getQualifiedItem(localName, nsURI) || null;
    };

    var findFirstNode = function (node, tagname, pname, pvalue, recursive) {

        var fNode = null;
		if (!node) {
			return fNode;
		}	
        util.xmlTraverse(node, recursive, function (child) {
            if (child.nodeType === 1) {
                if (tagname === child.tagName) {
					if (pname) {
						var attr = getAttribute(child, pname, "");
						if (attr && attr.value == pvalue) {
							fNode = child;
						}	
					} else {
						fNode = child;
					}
                }
            }
            return {proceed:fNode === null, downward:true};
        });
        return fNode;
    };
	
	util.getNode = function (pDoc, ins, iname) {
		var xmlNode = null;
		if (!pDoc) {
			return xmlNode;
		}	
		var parts = iname.split("/");
        
		xmlNode = pDoc;
		//compare targetNamespace and ins
		
        var i, len;
        for (i = 0, len = parts.length; i < len; i++) {
            var name = parts[i];
            var childNode = findFirstNode(xmlNode, "xs:element", "name", iname, true);
            //if (!childNode) {
            //}
            xmlNode = childNode;
		}
		
		return xmlNode;
	};
	util.getChildNodesOfSchemaNode = function(pDoc, tagname) {
		var rnodes = [];
		if (!pDoc) {
			return rnodes;
		}	
		util.xmlTraverse(pDoc, false, function (child) {
			if (child.nodeType === 1) {
				if (child.tagName === tagname) {						
					rnodes.push(child);
				}
			}
			return {proceed:true, downward:true};
		});		
		return rnodes;
	};
	util.getChildNodesOfSchemaNodeFromAll = function(schemaList, cns, tagname) {
		var rnodes = [];
		var doc = null;
		for (var i=0; i<schemaList.length; i++) {
			if (cns == schemaList[i].ns) {
				var sDoc = util.getSchemaNode(schemaList[i].xmlDoc, cns);
				rnodes = rnodes.concat(util.getChildNodesOfSchemaNode(sDoc, tagname));
			}
		}
		return rnodes;
	};
	util.getChildNodesFromTypeOrGroup = function(schemaList, cns, typeNode) {
		var rnodes = [];
		if (!typeNode) {
			return rnodes;
		}
		
		var typeDetailNode = null;
		typeDetailNode = findFirstNode(typeNode, "xs:all", null, null, false);
		if (!typeDetailNode) {
			typeDetailNode = findFirstNode(typeNode, "xs:sequence", null, null, false);
		}
		if (!typeDetailNode) {
			typeDetailNode = findFirstNode(typeNode, "xs:choice", null, null, false);
		}
		if (typeDetailNode) {
			util.xmlTraverse(typeDetailNode, false, function (child) {
				if (child.nodeType === 1) {
					if (child.tagName === "xs:element") {						
						rnodes.push(child);
					} else if (child.tagName === "xs:group") {
						var ref = getAttribute(child, "ref", "");
						if (ref) {
							var groupNode = util.xmlFindNodeFromAll(schemaList, cns, "xs:group", "name", ref.value, true);
							if (groupNode) {
								rnodes = rnodes.concat(util.getChildNodesFromTypeOrGroup(schemaList, cns, groupNode));
							}
						}
					} else if (child.tagName === "xs:any") {
						rnodes = rnodes.concat(util.getChildNodesOfSchemaNodeFromAll(schemaList, cns, "xs:element"));
					}
				}
				return {proceed:true, downward:true};
			});		
		}
		return rnodes;
	};
	util.xmlFindNodeFromAll = function(schemaList, cns, tagname, pname, pvalue, recursive) {
		var node = null;
		var doc = null;
		
		for (var i=0; i<schemaList.length; i++) {
			if (cns == schemaList[i].ns) {
				var sDoc = util.getSchemaNode(schemaList[i].xmlDoc, cns);
				node = findFirstNode(sDoc, tagname, pname, pvalue, recursive);
				if (node) {
					doc = schemaList[i].xmlDoc;
					break;
				}
			}
		}
		return node;
	};
	util.getChildNodes = function(schemaList, pNode, cns) {
		var cnodes = [];
		if (!pNode) {
			return cnodes;
		}
		
		var attr = getAttribute(pNode, "type", "");
		var typeNode = null;
		if (attr) {
			typeNode = util.xmlFindNodeFromAll(schemaList, cns, "xs:complexType", "name", attr.value, true);
		} else {
			typeNode = findFirstNode(pNode, "xs:complexType", null, null, false);
		}
		var rnodes = util.getChildNodesFromTypeOrGroup(schemaList, cns, typeNode);
		for (var i=0; i< rnodes.length; i++){ 
			var cname = "";
			var rattr = getAttribute(rnodes[i], "name", "");
			if (rattr) {
				cname = rattr.value;
			} else {
				rattr = getAttribute(rnodes[i], "ref", "");
				if (rattr) {
					cname = rattr.value;
				}
			}
			//remove the duplicate node
			cnodes.push({name: cname});
		}
		return cnodes;
	};
    util.xmlTraverse = function (domNode, recursive, onChildCallback) {

        var subtrees = [];
        var child = domNode.firstChild;
        var proceed = true;
		var downward = true;
        while (child && proceed) {
            var ret = onChildCallback(child);
			proceed = ret.proceed;
			downward = ret.downward;
            if (proceed) {
                if (recursive && child.firstChild && downward) {
                    subtrees.push(child.firstChild);
                }
                child = child.nextSibling || subtrees.shift();
            }
        }
    };
	util.getAttrNodesFromNodeOrGroup = function(schemaList, cns, typeNode) {//?
		var rnodes = [];
		if (!typeNode) {
			return rnodes;
		}
		
		util.xmlTraverse(typeNode, true, function (child) {
			var downward = true;
			if (child.nodeType === 1) {
				if (child.tagName === "xs:element") {
					downward = false;
				} else if (child.tagName === "xs:attribute") {						
					rnodes.push(child);
				} else if (child.tagName === "xs:attributeGroup") {
					var ref = getAttribute(child, "ref", "");
					if (ref) {
						var groupNode = util.xmlFindNodeFromAll(schemaList, cns, "xs:attributeGroup", "name", ref.value, true);
						if (groupNode) {
							rnodes = rnodes.concat(util.getAttrNodesFromNodeOrGroup(schemaList, cns, groupNode));
						}
					}
				} else if (child.tagName === "xs:anyAttribute") {
					rnodes = rnodes.concat(util.getChildNodesOfSchemaNodeFromAll(schemaList, cns, "xs:attribute"));
				}
				
			}
			return {proceed:true, downward:downward};
		});		
		return rnodes;
	};
	util.getAttrNode = function(schemaList, ans, aname) {
		var aNode = util.xmlFindNodeFromAll(schemaList, ans, "xs:attribute", "name", aname, true);
		return aNode;
	};
	util.getAttrInfo = function(schemaList, cns, attrNode) {
		var info = {};
		var aNode = attrNode;
		var typeNode = null;
		var attr = getAttribute(attrNode, "ref", "");
		if (attr) {
			var refNode = util.xmlFindNodeFromAll(schemaList, cns, "xs:attribute", "name", attr.value, false);
			if (refNode) {
				aNode = refNode;
			}
		}		
		attr = getAttribute(aNode, "name", "");
		if (attr) {
			info.name = attr.value;
			var dtype = getAttribute(aNode, "type", "");
			var tNode = aNode;
			if (dtype) {
				typeNode = util.xmlFindNodeFromAll(schemaList, cns, "xs:complexType", "name", dtype.value, true);
				if (!typeNode) {
					info.dType = dtype.value;
				} else {
					tNode = typeNode;
				}
			}
			var enumOptions = [];
			util.xmlTraverse(tNode, true, function (child) {
				var downward = true;
				if (child.nodeType === 1) {
					if (child.tagName === "xs:element") {
						downward = false;
					} else if (child.tagName === "xs:enumeration") {
						var op = getAttribute(child, "value", "");
						enumOptions.push(op.value);
					} 					
				}
				return {proceed:true, downward:downward};
			});
			if (enumOptions.length>0) {
				info.enumOptions = enumOptions;
			}
		} 
		return info;
	};
	util.getAttributes = function(schemaList, cNode, cns) {
		var attrs = [];
		if (!cNode) {
			return attrs;
		}
		
		var attr = getAttribute(cNode, "type", "");
		var typeNode = null;
		if (attr) {
			typeNode = util.xmlFindNodeFromAll(schemaList, cns, "xs:complexType", "name", attr.value, true);
		} else {
			typeNode = findFirstNode(cNode, "xs:complexType", null, null, false);
		}
		var rnodes = util.getAttrNodesFromNodeOrGroup(schemaList, cns, typeNode);
		for (var i=0; i< rnodes.length; i++){ 
			var info = util.getAttrInfo(schemaList, cns, rnodes[i]);
			if (info) {
				attrs.push({name: info.name, dType: info.dType, enumOptions: info.enumOptions});
			}
		}
		return attrs;		
	};
	util.getSchemaNS = function(sNode) {
		var attributes = sNode.attributes;
        if (attributes.getNamedItem) {
            return attributes.getNamedItem("xmlns");
        }

        return attributes.getQualifiedItem("xmlns", "") || "";
	};
	util.getSchemaNode = function(pDoc, cns) {
		var rNode;
		
		var sNode = findFirstNode(pDoc, "xs:schema", null, null, true);
		var sns1 = "", sns2 = "";
		var attr = getAttribute(sNode, "targetNamespace", "");
		if (attr) {
			sns1 = attr.value;
		}	
		attr = util.getSchemaNS(sNode, "xmlns");
		if (attr) {
			sns2 = attr.value;
		}
		if (cns == sns1 && cns == sns2) {
			rNode = sNode;
		}
		
		return rNode;
	};
	return {util: util};

});