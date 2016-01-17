define([
        
    ],
    function() {
	
	var button = new sap.ui.commons.Button();
	
	button.setText("Rajesh");
	
	button.placeAt("SCTest");
	
	QUnit.module('Ui Unit Test For Semantic Columns ', {
        
    });
    QUnit.test("InitialOk", function() {

        equal(button.getText(), "Rajesh", "success");

    });
	
	
});