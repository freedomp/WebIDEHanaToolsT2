define(function () {
	"use strict";
	// ------------------------------- XML Helper Functions -------------------------------
	function traverseNodeTree(oNode, fn, aNodes) {
		var sNode = fn(oNode);
		if (sNode != undefined) {
			aNodes.push(sNode);
		}
		oNode = oNode.firstChild;
		while (oNode) {
			traverseNodeTree(oNode, fn, aNodes);
			oNode = oNode.nextSibling;
		}
		return aNodes;
	}

	function processNode(oNode) {
		var sNodeIdentifier = "";
		// only output 'controls' and comments
		if (oNode.nodeType === 1 || oNode.nodeType === 8) {
			sNodeIdentifier = oNode.nodeName;
			try {
				// not all nodes have getAttribute, or the id could be empty
				sNodeIdentifier = oNode.getAttribute("id") || sNodeIdentifier;
			} catch (error) { /* no error handling */
			}
			return sNodeIdentifier;
		}
	}

	function getXMLofRootControl(oDesignTime) {
		var oView;
		oView = sap.ui.getCore().byId(oDesignTime.getRootElements()[0]);
		return oView && oView.__XMLNode;
	}

	return {
		traverseNodeTree: traverseNodeTree,
		processNode: processNode,
		getXMLofRootControl: getXMLofRootControl
	};
});
