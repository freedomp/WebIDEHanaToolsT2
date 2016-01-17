define([], function () {
	"use strict";
	
	function createFixturesDiv(webIdeWindowObj) {
		var fixturesDiv = webIdeWindowObj.document.createElement("div");
		fixturesDiv.id = "fixtures";
		fixturesDiv.style.display = "none";
		fixturesDiv.style.visibility = "hidden";
		webIdeWindowObj.document.body.appendChild(fixturesDiv);
    }
    
	var Document = function(sTitle, sFullPath, bDirty) {
		this.title = sTitle;
		this.entity = {
			getFullPath : function() {
				return this.fullPath;
			}
		};
		this.fullPath = sFullPath;
		this.dirty = bDirty;
		
		this.getEntity = function() {
			return this.entity;
		};
		
		this.isDirty = function() {
			return this.dirty;
		};
		
		this.getTitle = function() {
			return this.title;
		};
	};
	var oNavBar;
		
	describe("WATT NavigationBar control", function () {
		
		before(function() {
			createFixturesDiv(window);
			jQuery.sap.registerModulePath("sap.watt.platform.plugin.content", require.toUrl("sap/watt/platform/plugin/content"));
			jQuery.sap.require("sap.watt.platform.plugin.content.control.NavigationBar");
			sap.ui.getCore().applyTheme("sap_flat");
			oNavBar = new sap.watt.platform.plugin.content.control.NavigationBar();
			oNavBar.placeAt("fixtures");
			sap.ui.getCore().applyChanges();
		});
		
		after(function() {
			oNavBar.destroy();
			$("#fixtures").remove();
		});
		
		it("navBar API test", function() {
			expect(oNavBar, "Navigation Bar has been instantiated").to.exist;
			
			var iTabIndex1 = oNavBar.createTab({
				title : "pom.xml",
				tooltip : "/com.sap.watt/com.sap.watt-maven-plugin/pom.xml",
				fullQualifiedName : "/com.sap.watt/com.sap.watt-maven-plugin/pom.xml",
				document : new Document("pom.xml", "/com.sap.watt/com.sap.watt-maven-plugin/pom.xml", false)
			});
			sap.ui.getCore().applyChanges();
			
			expect(oNavBar.getSelectedIndex(), "Created Tab without selecting it").to.not.exist;
			expect($(".sapUiUx3NavBarItem:last").text(), "created tab has 'pom.xml' title").to.equal("pom.xml");
			expect(iTabIndex1, "Created tab index is 0").to.equal(0);
			
			var oDocument2 = new Document("file.js", "/com.sap.watt/com.sap.watt-maven-plugin/pom.xml", false);
			var iTabIndex2 = oNavBar.createTab({
				title : "file.js",
				tooltip : "/com.sap.watt/com.sap.watt-maven-plugin/file.js",
				fullQualifiedName : "/com.sap.watt/com.sap.watt-maven-plugin/file.js",
				document : oDocument2
			},true);
			sap.ui.getCore().applyChanges();
			
			oNavBar.selectTab(iTabIndex2, true);
			expect(oNavBar.getSelectedIndex(), "Created Tab with selecting it").to.equal(1);
			expect($(".sapUiUx3NavBarItem:last").text(), "created tab has 'pom.xml' title").to.equal("file.js");
			expect(iTabIndex2, "Created tab index is 1").to.equal(1);

			/* set title of a given Tab*/
			oNavBar.setTitle(0, "POMMES");
			sap.ui.getCore().applyChanges();
			
			/*the first item is a dummy one this is why tab with index 0 is the second (index 1) navBarItem and not the first (index 0)*/
			expect($(".sapUiUx3NavBarItem")[1].text, "tab with index 0 has a new title").to.equal("POMMES");
			expect($(".sapUiUx3NavBarItem")[1].title, "tab with index 0 kept the old tooltip").to.equal("/com.sap.watt/com.sap.watt-maven-plugin/pom.xml");
			
			/* set title and tooltip of a given Tab*/
			oNavBar.setTitle(0, "POM", "POM FILE!" );
			sap.ui.getCore().applyChanges();
			
			/*the first item is a dummy one this is why tab with index 0 is the second (index 1) navBarItem and not the first (index 0)*/
			expect($(".sapUiUx3NavBarItem")[1].text, "tab with index 0 has a new title").to.equal("POM");
			expect($(".sapUiUx3NavBarItem")[1].title, "tab with index 0 has a new tooltip").to.equal("POM FILE!");
			
			/* setter for dirty state of a given tab*/
			oDocument2.dirty = true;
			oNavBar.setDirtyStateTab(1, true);
			sap.ui.getCore().applyChanges();
			
			/* getter for dirty state of a given tab*/
			expect(oNavBar.getDirtyStateTab(1), "tab with index 1 is dirty").to.be.true;
			expect(oNavBar.getDirtyStateTab(0), "tab with index 0 is not dirty").to.be.false;
			
			/* getter calculating what would be the next selected tab's index after closing a given tab*/ 
			//expect(oNavBar.getSelectedIndexAfterClose(1) == 0, "selected tab would be tab with index 0 after closing tab with index 1").to.be.true;
			//expect(oNavBar.getSelectedIndexAfterClose(0) == 0, "selected tab would be tab with index 0 after closing tab with index 0").to.be.true;
			
			/* checks if the tabStrip has any opened tabs*/
			expect(oNavBar.hasTabs(), "TabStrip has opened tabs").to.be.true;			
			
			oNavBar.selectTab(0);
			expect(oNavBar.getSelectedIndex(), "Selecting a tab").to.equal(0);
			
			expect(document.getElementsByClassName("sapUiUx3NavBarItem")[2].parentElement.classList.contains("wattTabDirty"), "tab with index 1 has dirty css class").to.be.true;
			expect(document.getElementsByClassName("sapUiUx3NavBarItem")[2].text.toUpperCase() === "*FILE.JS", "tab with index 1 has dirty text").to.be.true;
			//@TODO to be continued with more tests.
		});
	});
});