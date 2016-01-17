define(function() {
	"use strict";

	var sortByPrio = function(a, b) {
		return a.prio - b.prio;
	};

	return {
		_aDecorators : [],

		init : function() {

		},

		configure : function(mConfig) {
			this._aDecorators = this._aDecorators.concat(mConfig.decorators);
			this._aDecorators.sort(sortByPrio);
		},
		
		areDecoratorsAvailable: function(){
			return this._aDecorators.length > 0;
		},

		decorate : function(mDocument,oEvent) {
			var mReturnValue = [];

			var aPromises = [];
			jQuery.each(this._aDecorators, function(iIndex, mDecorator) {
				aPromises.push(mDecorator.service.decorate(mDocument, oEvent));
			});

			return Q.all(aPromises).then(function(aResults) {
				jQuery.each(aResults, function(iIndex, mResult) {
					if (mResult) {
						mReturnValue.push(mResult);
					}
				});
				return mReturnValue;
			});
		},
        updateDecorations : function (aDocuments, bUpdateChildren, oEvent) {
            // Handle single documents / no documents
            if (!(aDocuments instanceof Array)) {
                aDocuments = aDocuments ? [aDocuments] : [];
            }
            return this.context.event.fireDecorationsChanged({
                "documents" : aDocuments,
                "updateChildren" : bUpdateChildren,
                "event" : oEvent
            });
        }
	};

});