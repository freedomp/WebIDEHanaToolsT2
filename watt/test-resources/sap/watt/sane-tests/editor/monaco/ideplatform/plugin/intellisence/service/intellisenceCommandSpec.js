//  The SaneTestFramework should be imported via 'STF' path.
define(["STF", "sinon"], function(STF, sinon) {
	"use strict";

	//  every suite must have a uniqueName. using a none unique name will cause an error.
	var suiteName = "intellisence_service_tests";
	var oCommandService;
	var oSelectionService;
	var oIntellisenceCommand;
	var sandbox;
	
	var SelectionOwner = function(sServiceName, bIsVisible) {
        this.sServiceName = sServiceName;
        this.bIsVisible = bIsVisible;
        
    	this.instanceOf = function(sOtherServiceName) {
	    	return sOtherServiceName === sServiceName;
	    };
	    
	    this.getVisible = function() {
	        return Q(bIsVisible);
	    };
	};

	describe("Intellisence Command", function() {
		before(function() {
			return STF.startWebIde(suiteName, {config : "editor/monaco/ideplatform/plugin/intellisence/service/config.json"}).
			then(function() {
				sandbox = sinon.sandbox.create();
				oCommandService = STF.getService(suiteName, "command");
				oSelectionService = STF.getService(suiteName, "selection");
				return oCommandService.getCommand("intellisence");
			}).then(function(oCommand){
	        	oIntellisenceCommand = oCommand;
				return STF.require(suiteName, ["sane-tests/util/mockDocument"]);
			});
		});
		
		after(function() {
			STF.shutdownWebIde(suiteName);
		});
		
		afterEach(function() {
			sandbox.restore();
		});

		it("Intellisence command should be disabled when selection owner is not ace editor", function() {
	        var oSelectionOwner = new SelectionOwner("sap.watt.common.service.ui.Browser", true);
			sandbox.stub(oSelectionService, "getOwner").returns(Q(oSelectionOwner));
            return oIntellisenceCommand._oService.isEnabled().then(function(bIsEnabled) {
                expect(bIsEnabled).to.be.false;
            });
		});
		
	    it("Intellisence command should be enabled when selection owner is ace editor", function() {
        	var oSelectionOwner = new SelectionOwner("sap.watt.common.plugin.aceeditor.service.Editor", true);
		    sandbox.stub(oSelectionService, "getOwner").returns(Q(oSelectionOwner));
            return oIntellisenceCommand._oService.isEnabled().then(function(bIsEnabled) {
                expect(bIsEnabled).to.be.true;
            });
		});
	});
});