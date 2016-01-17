function(context) {
	"use strict";
	return {
        IfStatement: function(node) {
            var source = context.getSource(node.test, 0, 2);        
            if (!source.match(/ {$/)) {
                context.report(node, "Found improperly formatted if-statement"); 
            }
        }
    };
};