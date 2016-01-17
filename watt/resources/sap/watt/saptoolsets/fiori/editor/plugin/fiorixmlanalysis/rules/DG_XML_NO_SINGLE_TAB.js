/*global define*/
define([], function() {
	"use strict";







	return {
		id: "DG_XML_NO_SINGLE_TAB",
		category: "Desgin Guidelines Error",
		path: "//ns:IconTabBar/ns:items[count(ns:IconTabFilter)=1]//ancestor::ns:IconTabBar",
		errorMsg: "An icon tab bar should at least have two icon tab filter.",
		validate: function(report, path, nodes){
			var result = [];
//			console.log("validating (" + this.id + ")");
			for(var i = 0; i < nodes.length; i++){
				var node = nodes[i];
				if(node){
					result.push(node);
				}
			}
			return result;
		}
	};
});
