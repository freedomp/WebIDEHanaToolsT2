/*global define*/
define([], function() {
	"use strict";
	function createTabbarObj(tabbar){
		return {
			tabbar: tabbar,
			iconList: {}
		};
	}

	function getTabbarObj(tabbarList, tabbar){
		for(var i = 0, l = tabbarList.length; i < l; i++){
			if(tabbarList[i].tabbar === tabbar){return tabbarList[i]; }
		}
		// create new tabbarObj / insert tabbarObj / return tabbarObj
		return tabbarList[tabbarList.push(createTabbarObj(tabbar)) - 1];
	}

	return {
		id: "DG_XML_NO_DUPLICATE_ICONS",
		category: "Desgin Guidelines Error",
		path: "//ns:IconTabBar/ns:items/ns:IconTabFilter[@icon]",
		errorMsg: "A specific icon must not occur twice in a tab bar",
		validate: function(report, path, nodes){
			var result = [], tabbarList = [];
//			console.log("validating (" + this.id + ")");
			for(var i = 0; i < nodes.length; i++){
				var node = nodes[i];
				if(node){
					var tabbar = node.parentNode.parentNode,
					tabbarObj = getTabbarObj(tabbarList, tabbar),
					icon = node.getAttribute("icon"),
					iconList;
					if(tabbarObj){
						iconList = tabbarObj.iconList;
						iconList[icon] = iconList[icon] || [];
						iconList[icon].push(node);
					}
				}
			}
			for(var j = 0, m = tabbarList.length; j < m; j++){
				tabbar = tabbarList[j];
				for(var key in tabbar.iconList){
					if(iconList[key].length > 1){
						result = result.concat(iconList[key]);
					}
				}
			}
			return result;
		}
	};
});
