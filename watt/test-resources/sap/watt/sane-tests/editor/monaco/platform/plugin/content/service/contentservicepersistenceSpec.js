//  The SaneTestFramework should be imported via 'STF' path.
define(["STF"], function(STF) {
	"use strict";

	//  every suite must have a uniqueName. using a none unique name will cause an error.
	var suiteName = "contentpersistence_service_tests";

	var oContentPersistenceService;
	var mTabsExpected;
	
	describe("contentPersistence Service", function() {
		before(function() {
			return STF.startWebIde(suiteName, {config : "editor/monaco/platform/plugin/content/service/config.json"}).
			then(function() {
				oContentPersistenceService = STF.getService(suiteName, "contentPersistence");
				mTabsExpected = [
					{keyString : "file:/a/a", editor : "aceeditor"},
                    {keyString : "file:/b/b", editor : "ui5wysiwygeditor"},
                    {keyString : "file:/c/c", editor : "imageviewer"}
                ];
			});
		});
		
		after(function() {
			STF.shutdownWebIde(suiteName);
		});
		
		it("Add tab and check if all are stored", function() {
    		return Q.all([
    		         oContentPersistenceService.add(mTabsExpected[0]),
    		         oContentPersistenceService.add(mTabsExpected[1]),
    		         oContentPersistenceService.add(mTabsExpected[2])
    		       ]).then(function(){
    			return oContentPersistenceService.getTabs().then(function(mTabs) {
    				expect(mTabs).to.exist;
    				var i = 0;
    				for ( var tab in mTabs) {
						expect(mTabs[tab].keystring).to.equal(mTabsExpected[i].keyString); 
						expect(mTabs[tab].editor).to.equal(mTabsExpected[i].editor); 
						i++;
					}
    			});
    		});
        });
        
        it("Remove tab and check if the other ones are still available", function() {
            return oContentPersistenceService.remove(mTabsExpected[0]).then(function(){
                return oContentPersistenceService.getTabs().then(function(mTabs) {
                	expect(mTabs).to.exist;
                    var i = 1;
                    for ( var tab in mTabs) {
                    	expect(mTabs[tab].keystring).to.equal(mTabsExpected[i].keyString); 
						expect(mTabs[tab].editor).to.equal(mTabsExpected[i].editor); 
                        i++;
                    }
                });
            });
        });
    	
        it("adding of wrong objects to persistence service", function() {
        	 var oPromise = oContentPersistenceService.add({
            	document : {},
                editor : []
            });
            return expect(oPromise).to.eventually.be.rejected;
        });
	});
});