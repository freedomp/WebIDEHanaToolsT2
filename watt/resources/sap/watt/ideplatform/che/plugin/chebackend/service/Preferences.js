define([ "../dao/Preferences", "sap/watt/lib/lodash/lodash" ],

//		This interface is a draft covering the most simple solution possible. It may be enhanced in the future. 
//		The DAO has some more possibilities to read/write single attributes with less overhead.
//		This is intentionally not yet used here.

		function(oPreferenceDAO, _) {
	"use strict";
	var oSettings = {

			_oDao : oPreferenceDAO,

			// default preference node name
			_sDefaultNode : "userpref",
			// prefix for watt preferences in order to not interfere with orion own preferences such as for orion git
			_sPrefix : "watt",
			// preference cache
			_cache : undefined,
			// queue to serialize initial cache fill
			_oReadQueue : new Q.sap.Queue(),

			set : function(oSettings, sNode) {
				var that = this;
				return this.get(sNode).then(function(oOldSettings){
					// write through cache policy, but write only if json object is different
					if (!that._JSONEquals(oOldSettings, oSettings)) {
						// Attention: always clone. Otherwise equality comparison will always be true
						that._cache[sNode] =  _.cloneDeep(oSettings); //jQuery.extend(true, {}, oSettings);
						return that._oDao.writePreferenceNode(that._getPrefNode(sNode), oSettings);
					}
				});
			},

			get : function(sNode) {
				var that = this;
				return this._oReadQueue.next(function() {
					return that._get(sNode);
				});
			},

			_get : function(sNode) {
				var that = this;
				// if already cached, use cache
				if (!this._cache) {
					// otherwise read from orion
					return this._oDao.read(this._sPrefix).then(function(oSettings){
						that._cache = that._splitIntoCache(oSettings);
					}).then(function(){
						return that._cache[sNode];
					}).fail(function(oError){
						console.error("Preferences: cannot get node. ", oError);
						return Q({});
					});
				} else {
					return Q(this._cache[sNode]);
				}
			},

			remove : function(sNode) {
				// write through cache policy
				if (this._cache) {
					delete this._cache[sNode];
				}
				return this._oDao.remove(this._getPrefNode(sNode), null);
			},

			// creates a json cache from orion data with deep structure
			_splitIntoCache :function(oJson){
				var mResult = {};
				if (oJson) {
					var aKeys = Object.keys(oJson);
					for (var i=0; i<aKeys.length; i++) {
						var oKey = aKeys[i];
						var iSplitPoint = oKey.indexOf('/');
						if (iSplitPoint > -1 ) {
							var sBase = oKey.substring(0, iSplitPoint);
							mResult[sBase] = mResult[sBase] || {};
							var skey = oKey.substring(iSplitPoint+1, oKey.length);
							mResult[sBase][skey] = oJson[oKey];
						}
					}
				}
				return mResult;
			},

			_getPrefNode : function(sNode) {
				var sPrefNode = sNode || that._sDefaultNode;
				return this._sPrefix + "/" + sPrefNode;
			},

			// provides a deep compare of JSOn objects
			_JSONEquals : function( o1, o2 ) {
				if ( o1 === o2 ) {
					return true;
				}
				if ( ! ( o1 instanceof Object ) || ! ( o2 instanceof Object ) ) {
					return false;
				}
				for ( var p in o1 ) {
					if ( ! o1.hasOwnProperty( p ) ) {
						continue;
					}
					if ( ! o2.hasOwnProperty( p ) ) {
						return false;
					}
					if ( o1[ p ] === o2[ p ] ) {
						continue;
					}
					if ( typeof( o1[ p ] ) !== "object" ) {
						return false;
					}
					if ( ! this._JSONEquals( o1[ p ],  o2[ p ] ) ) {
						return false;
					}
				}
				for ( p in o2 ) {
					if ( o2.hasOwnProperty( p ) && ! o1.hasOwnProperty( p ) ) {
						return false;
					}
				}
				return true;
			}

	};

	return oSettings;

});