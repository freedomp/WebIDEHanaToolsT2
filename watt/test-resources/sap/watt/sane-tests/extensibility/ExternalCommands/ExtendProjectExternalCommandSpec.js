define(['sap/watt/saptoolsets/fiori/common/plugin/fioriexternalcommands/extendproject/ExtendProject' ,
		'sap/watt/saptoolsets/fiori/common/plugin/fioriexternalcommands/extendproject/ui/AuthenticationDialog'], function (ExtendProject, AuthenticationDialog) {

	"use strict";

	//Unit tests
	describe('Extend project external command', function () {
		describe('with invalid output', function() {
			it('throws an error if the project name is falsy', function() {
				var testFn1 = function() {
					ExtendProject.execute({"parentProjectName":undefined,"createEvenIfExists":true,"openExtPane":false});
				};
				expect(testFn1).to.throw(Error, "No application name supplied.");
				
				var testFn2 = function() {
					ExtendProject.execute({});
				};
				expect(testFn2).to.throw(Error, "No application name supplied.");
			});

			it('check authentication dialog - project name already exist', function() {
				var oContext = {};
				oContext.service = {};
				oContext.service.filesystem = {};
				oContext.service.filesystem.documentProvider = {};
				oContext.service.filesystem.documentProvider.getRoot = function(){
					var oRoot = {
						getCurrentMetadata : function(){
							return Q([{name : "projec1"} , {name : "projec2"}]);
						}
					};
					return Q(oRoot);
				};

				AuthenticationDialog.setContext(oContext);
				AuthenticationDialog.validateProjectName("projec1").then(function(validation){
					expect(validation.isValid).to.be.false;
					expect(validation.error).to.equal("ExternalCommand_projectexistsmsg");

				}).done();
			});

		});
	});
});