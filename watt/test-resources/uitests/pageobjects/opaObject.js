sap.ui.define(["sap/ui/test/Opa5"], function(Opa5){

    return Opa5.createPageObjects({
        ourOpaTestObj : {

			actions: {
/*				iStartMyApp : function () {
					return this.iStartMyAppInAFrame("../test-resources/uitests/sample/index.html");
				},*/
				
				isGivenTrue : function() {
					return this.waitFor({
						timeout : 1,
						check : function() {
							return true;
						},
						
						success : function() {
						},
						
						error : function() {
							ok(false,"my bad");
						}
					});
				},
				
				isGivenFalse : function() {
				
					return this.waitFor({
						timeout : 1,
						check : function() {
							return false;
						},
						
						success : function() {
						},
						
						error : function() {
							ok(false,"my bad");
						}
					});
				},

				iWhen1 : function() {
					return this.waitFor({
						timeout : 1,
						check : function() {
							return true;
						},
						
						success : function() {
							return "test passed";
						},
						
						error : function() {
							return "test failed";
						}
					});
				},
				
				iWhen2 : function() {
					return this.waitFor({
						timeout : 1,
						check : function() {
							return false;
						},
						
						success : function() {
							return "test passed";
						},
						
						error : function() {
							return "test failed";
						}
					});
				}
			},

			assertions: {
				iThenSuccess: function() {
					return this.waitFor({
						timeout : 1,
						check : function() {
							return true;
						},
						
						success : function() {
							ok(true, "success");
						},
						
						error : function() {
							ok(false, "failure");
						}
					});
				},
				iThenFail: function() {
					return this.waitFor({
						timeout : 1,
						check : function() {
							return false;
						},
						
						success : function() {
							ok(true, "success");
						},
						
						error : function() {
							ok(false, "faliure");
						}
					});
				}
			}
		}
	});

});
