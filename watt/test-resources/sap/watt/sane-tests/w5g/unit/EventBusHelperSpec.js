define(["w5g/w5gTestUtils" , "sap/watt/saptoolsets/fiori/editor/plugin/ui5wysiwygeditor/utils/EventBusHelper"],
		function (w5gTestUtils , EventBusHelper) {
			"use strict";
			describe("W5G EventBus Helper" , function () {

				var TEST_INDETIFIER = "test identifier";

				it("test subscribe and publish" , function (done) {
					EventBusHelper.subscribe(TEST_INDETIFIER , function(oData) {
						assert.ok(oData.param , "callback should be evoked with boolean parameter");
						done();
					});

					EventBusHelper.publish(TEST_INDETIFIER , {
						param: true
					});
				});

			});
		});


