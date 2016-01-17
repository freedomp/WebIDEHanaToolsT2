define([ "./Traverse" ], function(oTraverse) {

	var listItemAteributeNames = [ "title", "number", "numberUnit" ];

	var _getModeljson = function(mockupModelObj) {

		var jsonModel = {};
		jsonModel.fioriApp = {};
		jsonModel.fioriApp.name = "";
		jsonModel.fioriApp.elements = [];
		var masterView = _handleView("Master");
		var masterViewElements = masterView.elements;
		var detailView = _handleView("Detail");
		var detailViewElements = detailView.elements;

		jsonModel.fioriApp.elements.push(masterView);
		jsonModel.fioriApp.elements.push(detailView);
		_buildMasterView(mockupModelObj, masterViewElements);
		_buildDetailView(mockupModelObj, detailViewElements);
		return jsonModel;
	};

	_buildDetailView = function(mockupModelObj, detailViewElements) {

		var pageNode = _costrucPageNode(mockupModelObj);
		detailViewElements.push(pageNode);
	};

	var _costrucPageNode = function(mockupModelObj) {
		var pageNode = _construcBasicNode("Page");

		pageNode.Attributes.push({
			name : "class",
			value : "sapUiFioriObjectPage"
		});
		pageNode.Attributes.push({
			name : "title",
			value : "Item Details"
		});
		pageNode.Attributes.push({
			name : "showNavButton",
			value : "{device>/isPhone}"
		});

		pageNode.Attributes.push({
			name : "navButtonPress",
			value : "handleNavButtonPress"
		});

		var contentNode = _constructContentNode(mockupModelObj);
		pageNode.elements.push(contentNode);
		var footerNode = _constructFooterNode();
		pageNode.elements.push(footerNode);
		return pageNode;
	};

	var _constructFooterNode = function() {
		var footerNode = _construcBasicNode("footer");
		var barNode = _construcBasicNode("Bar");
		var contentRightNode = _construcBasicNode("contentRight");
		var buttonNode = _construcBasicNode("Button");

		buttonNode.Attributes.push({
			name : "id",
			value : "actionButton"
		});

		buttonNode.Attributes.push({
			name : "icon",
			value : "sap-icon://action"
		});

		buttonNode.Attributes.push({
			name : "press",
			value : "openActionSheet"
		});

		contentRightNode.elements.push(buttonNode);
		barNode.elements.push(contentRightNode);
		footerNode.elements.push(barNode);
		return footerNode;
	};

	var _constructContentNode = function(mockupModelObj) {

		var contentNode = _construcBasicNode("content");
		var headerNode = _construcBasicNode("ObjectHeader");

		// get node by name - "Object List Item *stretch*"

		var ObjectListItemstretch = oTraverse.getNodeByName(mockupModelObj, "Object List Item *stretch*");

		//get all textFilds from it.
		var labels = oTraverse.getNodesByType(ObjectListItemstretch.widgets.widgetOrWidgetContainer, "com.irise.irml.Text");

		contentNode.elements.push(headerNode);
		//1st 3 go to headerNode as attribs, the rest as labels under content

		for ( var index in labels) {
			if (index > 2) {
				contentNode.elements.push(_handleTextAsGenericNode(labels[index], "Label", "ui"));
			} else {
				headerNode.Attributes.push(_handleTextAsAttribute(listItemAteributeNames[index], labels[index], "ui"));
			}
		}

		// get node by name - "Tab Content Views"

		// build the following hierarchy \TabBar\items\TabFilter (1 attrib)
		//									    \content\ "dynamically  fill with textFilds"

		var tabBarNode = _construcBasicNode("IconTabBar");
		contentNode.elements.push(tabBarNode);

		var itemsNode = _construcBasicNode("items");
		tabBarNode.elements.push(itemsNode);

		var tabFilterNode = _construcBasicNode("IconTabFilter");
		itemsNode.elements.push(tabFilterNode);

		tabFilterNode.Attributes.push({
			name : "icon",
			value : "sap-icon://hint"
		});

		var tabBarNodeContent = _construcBasicNode("content");
		tabBarNode.elements.push(tabBarNodeContent);

		//dynamically  fill tabBarNodeContent elements with labels

		var TabContentViewsNode = oTraverse.getNodeByName(mockupModelObj, "Tab Content Views");

		labels = oTraverse.getNodesByType(TabContentViewsNode.widgets.widgetOrWidgetContainer[0], "com.irise.irml.Text");

		var grid = _construcBasicNode("l:Grid"); //requiers xmlns:l="sap.ui.layout"
		grid.Attributes.push({
			name : "class",
			value : "gridMarginTop"
		});
		grid.Attributes.push({
			name : "defaultIndent",
			value : "L1 M1 S1"
		});
		grid.Attributes.push({
			name : "defaultSpan",
			value : "L6 M6 S10"
		});

		tabBarNodeContent.elements.push(grid);

		var gridContent = _construcBasicNode("l:content");

		for ( var i = 0; i < labels.length; i++) {
			if ((i % 2) == 0) {
				var vBox = _construcBasicNode("HBox");
				var text1 = _construcBasicNode("Text");
				text1.Attributes.push({
					name : "text",
					toBind: "none",
					value : getTextContent(labels[i])
				});
				var text2 =  _construcBasicNode("Text");
				text2.Attributes.push({
					name : "text",
					toBind : "both",
					value : getTextContent(labels[i + 1])
				});
				vBox.elements.push(text1);
				vBox.elements.push(text2);
				gridContent.elements.push(vBox);
			}
		}

		grid.elements.push(gridContent);
		return contentNode;
	};

	var _construcBasicNode = function(nodeName) {
		return {
			type : nodeName,
			Attributes : [],
			elements : []
		};
	};

	//Build the master view
	var _buildMasterView = function(mockupModelObj, masterViewElements) {

		var tileNode = oTraverse.getNodeByType(mockupModelObj, "com.irise.irml.Tile");

		//found the Tile Node in IRise model
		//add the List element to master view
		listElement = {
			type : "List",
			Attributes : [],
			elements : []
		};

		masterViewElements.push(listElement);
		listElements = listElement.elements;

		listItem = {
			type : "ListItem",
			Attributes : [],
			elements : []
		};

		listElements.push(listItem);
		//get the List item labels from IRise

		listItemElements = listItem.elements;
		listItemAttributes = listItem.Attributes;

		var conditionalHTMLNode = oTraverse.getNodeByType(tileNode, "com.irise.irml.ConditionalHTML");
		var labels = oTraverse.getNodesByType(conditionalHTMLNode.widgets.widgetOrWidgetContainer[0], "com.irise.irml.Text");

		//append Members if needed
		if (labels.length > 3) {
			var members = {
				type : "Members",
				Attributes : [],
				elements : []
			};
			listItemElements.push(members);
		}

		var membersElements = members.elements;

		//the 1st 3 are attributes and the rest are members
		for ( var index in labels) {
			if (index > 2) {
				membersElements.push(_handleTextAsGenericNode(labels[index], "Member", "both"));
			} else {
				listItemAttributes.push(_handleTextAsAttribute(listItemAteributeNames[index], labels[index], "both"));
			}
		}

	};

	var _handleView = function(name) {

		var viewModel = {};
		viewModel.type = "View";
		viewModel.name = name;
		viewModel.xmlAttributes = [];
		viewModel.elements = [];
		return viewModel;
	};

	var _handleTextAsAttribute = function(name, jsonModel, toBind) {
		var textFieldAsAttribute = {};
		textFieldAsAttribute.name = name;
		textFieldAsAttribute.value = getTextContent(jsonModel);
		textFieldAsAttribute.toBind = toBind;
		return textFieldAsAttribute;
	};

	var getTextContent = function(labelJsonModel) {
		var properties = labelJsonModel.property;
		for ( var attr in properties) {
			if (properties[attr].name === "content") {
				return properties[attr].data[0];
			}
		}
	};

	var _handleTextAsGenericNode = function(jsonModel, nodeName, toBind) {
		var textFieldAsMember = {};
		textFieldAsMember.type = nodeName;
		textFieldAsMember.Attributes = [];
		textFieldAsMember.Attributes.push({
			name : "text",
			toBind : toBind,
			value : getTextContent(jsonModel)
		});
		return textFieldAsMember;
	};

	var _handleTextInput = function(jsonModel) {
		var textInputModel = {};
		textInputModel.type = "TextField";
		textInputModel.name = "";
		textInputModel.xmlAttributes = [];
		return textInputModel;
	};

	return {
		getModeljson : _getModeljson
	};
});