"use strict";
define(["STF", "sap/watt/core/q"], function (STF, coreQ) {

	var suiteName = "FioriLaunchpad_Service";

	describe('FioriLaunchpad Service', function () {

		var oFioriLaunchpadService;
		var oModel;
		var sProviderName;
		var oProjectJson;
		var oFileStructure;
		var oFakeFileDAO;
		var oFileSystemService;
		var oMockServer;
		var iFrameWindow;
		// mock sites
		var oSites = {"sites":[{"id":"7e40b90d-70c3-4a98-b6b5-5458390ebe5d","name":"Default","description":"","status":"published","updatedAt":1449408422000,"siteVersion":1449408422000,"publishedOn":1449408422000,"created":1448895917000,"updatedBy":"I034326","assignmentPackages":null,"schemaVersion":null,"thumbnail":null},{"id":"d59a5411-ca65-4cfd-a0ec-6c0a6b5fec61","name":"new new","description":"","status":"offline","updatedAt":1449490164000,"siteVersion":1449490164000,"publishedOn":null,"created":1449406917000,"updatedBy":"I034326","assignmentPackages":null,"schemaVersion":null,"thumbnail":null}],"permissions":1};
		var sSites = JSON.stringify(oSites);
		// mock groups
		var oGroups ={"groups":[{"id":"3e922228-6c53-401b-b33a-4e41d166cb42-1422793157613","title":"Default Group","originalLocale":"en-US","description":"Created by Michal","type":"static","enableP14nText":true,"assignedApps":[{"id":"65d88aaf-d0a1-4e74-8445-bfb2d636db9f","title":"Flights","tileTitle":"SVETA","tile_type":"chips.tiles.applauncherdynamic.DynamicTile"},{"id":"ff96d1be-4327-4f1a-ae77-dbea85b742a1","title":"Carriers","tileTitle":"Carrier","tile_type":"chips.tiles.applauncherdynamic.DynamicTile"}]},{"id":"a2e688a3-df50-48ad-9df4-c13ed132e737-1424956990083","title":"Gilboa Group","originalLocale":"en-US","description":"Gilboa Group","type":"static","enableP14nText":true,"assignedApps":[{"id":"a3331199-d697-4bd7-9e2c-8ac087422de5","title":"firastempExtension","tileTitle":"Firas Bla Bla Again","tile_type":"chips.tiles.applauncher.StaticTile"},{"id":"37739325-ee8b-4f0a-bb3d-dc23f360b63a","title":"Zaza","tileTitle":"Zaza Title","tile_type":"chips.tiles.applauncher.StaticTile"},{"id":"5451d123-d675-4186-8fe9-4ef2dfc8547c","title":"firastempextension1Batabata","tileTitle":"WATATATABATATA","tile_type":"chips.tiles.applauncher.StaticTile"}]}]};
		var sGroups = JSON.stringify(oGroups);
		// mock categories
		var oCategories = {"categories":[{"id":"a04c1c85-0e4d-4903-8976-bcff93303e94-1422263416533","type":"CATEGORY","title":"Default Category","description":"Default category created by Michal","created":"2015-01-26 00:00:00.000000000","created_by":"I059286","updated":"2015-01-26 00:00:00.000000000","assignedApps":[{"id":"01d092da-d703-4378-b890-6880109c9632","title":"batata","tileTitle":"Title","tile_type":"chips.tiles.applauncher.StaticTile"},{"id":"c8dd0c77-55de-4005-bd99-681d377a7c88","title":"batata","tileTitle":"Title","tile_type":"chips.tiles.applauncher.StaticTile"},{"id":"b24a5ec2-92f9-41a9-ac39-6123c6da7f6a","title":"wyz","tileTitle":"Title","tile_type":"chips.tiles.applauncher.StaticTile"},{"id":"5363cd6a-34b6-44c4-950e-5e7d5924d5d7","title":"batata","tileTitle":"Title","tile_type":"chips.tiles.applauncher.StaticTile"},{"id":"65f57765-717e-4fa3-9f14-a63d445a9d09","title":"firastempextension1","tileTitle":"Titledf","tile_type":"chips.tiles.applauncher.StaticTile"},{"id":"5ff7d513-3108-4665-b80b-c7399c6c1e26","title":"demoappExtension1","tileTitle":"MicTitle","tile_type":"chips.tiles.applauncher.StaticTile"},{"id":"5e9270c9-355e-4120-b781-5eb5ec4d0ce2","title":"wyz","tileTitle":"Title","tile_type":"chips.tiles.applauncher.StaticTile"},{"id":"987d8236-c87a-4082-9fad-f9e4aefc1749","title":"wyz","tileTitle":"vefix","tile_type":"chips.tiles.applauncher.StaticTile"},{"id":"1611b7aa-956b-4565-8e0f-396d15a8761e","title":"wyz","tileTitle":"vigul","tile_type":"chips.tiles.applauncher.StaticTile"},{"id":"656b52f1-6a3d-4594-99ee-7e9ac3b30730","title":"test222extension","tileTitle":"Title","tile_type":"chips.tiles.applauncher.StaticTile"},{"id":"a3331199-d697-4bd7-9e2c-8ac087422de5","title":"firastempExtension","tileTitle":"Firas Bla Bla Again","tile_type":"chips.tiles.applauncher.StaticTile"},{"id":"5451d123-d675-4186-8fe9-4ef2dfc8547c","title":"firastempextension1Batabata","tileTitle":"WATATATABATATA","tile_type":"chips.tiles.applauncher.StaticTile"},{"id":"fa4a2468-502d-425c-8c21-aac3194bd88d","title":"DemoFLP","tileTitle":"Title","tile_type":"chips.tiles.applauncher.StaticTile"},{"id":"1a81a75a-a8be-4cd2-9bd5-c600ce0b7405","title":"MichalTest3","tileTitle":"Booking","tile_type":"chips.tiles.applauncher.StaticTile"},{"id":"58bc265b-4d94-49ca-84d8-12136b6c4506","title":"MichalTest2","tileTitle":"CarriersStatic","tile_type":"chips.tiles.applauncherdynamic.StaticTile"},{"id":"2546c2ff-f480-4fa8-9a17-e375f1600164","title":"TestDep1","tileTitle":"Title","tile_type":"chips.tiles.applauncher.StaticTile"},{"id":"65d88aaf-d0a1-4e74-8445-bfb2d636db9f","title":"Flights","tileTitle":"SVETA","tile_type":"chips.tiles.applauncherdynamic.DynamicTile"},{"id":"27d570d3-3476-462c-976e-f6aaeab1ac03","title":"vereddeployrun","tileTitle":"Title","tile_type":"DynamicTile"},{"id":"8e3f1cc7-f8b3-47f7-a888-af5bbc1d9355","title":"vereddeployrun","tileTitle":"MicTitle","tile_type":"DynamicTile"},{"id":"b8147608-7dcf-45c5-846c-e8910a8bdfd2","title":"vereddeployrun","tileTitle":"Title","tile_type":"DynamicTile"},{"id":"f5b3244c-ea46-4c12-99b9-d1b8ae05ddc7","title":"vereddeployrun","tileTitle":"Title","tile_type":"DynamicTile"},{"id":"a9558a12-4e96-43ff-bc37-58ae65ae6cc0","title":"regiver","tileTitle":"Title","tile_type":"chips.tiles.applauncher.StaticTile"},{"id":"66430ef3-acfc-4e0d-9fe8-be7bf8af5fb7","title":"regiver","tileTitle":"Title","tile_type":"chips.tiles.applauncher.StaticTile"},{"id":"d8251a31-9885-449d-bfbd-442acdf53729","title":"batata","tileTitle":"Title","tile_type":"chips.tiles.applauncher.StaticTile"},{"id":"66b8c9cc-87f6-46c1-a2d8-4519c98e3216","title":"Newflp","tileTitle":"Title","tile_type":"chips.tiles.applauncher.StaticTile"},{"id":"7220d827-a8f0-4011-9116-c183f18050e8","title":"MyFlights","tileTitle":"Title","tile_type":"chips.tiles.applauncher.StaticTile"},{"id":"a4194154-3e5b-48a6-8417-bee3ae6ef618","title":"DemoFLPExtension2","tileTitle":"Title","tile_type":"chips.tiles.applauncher.StaticTile"},{"id":"6f4fad8b-71e9-4612-817b-951f10d1cbbd","title":"DemoFLPExtension2","tileTitle":"Title","tile_type":"chips.tiles.applauncher.StaticTile"},{"id":"e1bd8479-c98c-4518-9460-eb5afce6aee3","title":"demoflp1Extension1","tileTitle":"Title","tile_type":"chips.tiles.applauncher.StaticTile"},{"id":"41fe3292-6950-4ce9-b5eb-72c3a0a831c6","title":"demoflp1","tileTitle":"Title","tile_type":"chips.tiles.applauncher.StaticTile"},{"id":"779c48e9-8584-4f69-a01c-2ea74e826dc1","title":"DemoFLP","tileTitle":"Title","tile_type":"chips.tiles.applauncher.StaticTile"},{"id":"468e5668-80d2-4642-9053-a42cf27cee20","title":"DemoFLP","tileTitle":"Title","tile_type":"chips.tiles.applauncher.StaticTile"},{"id":"e157d670-11d3-4d96-8783-5e92d0231cea","title":"DemoFLP","tileTitle":"Title","tile_type":"chips.tiles.applauncher.StaticTile"},{"id":"c652e8cf-6d64-4445-a6ea-e2687b950573","title":"DemoFLP","tileTitle":"Title","tile_type":"chips.tiles.applauncher.StaticTile"},{"id":"f1ffcda3-9d23-4618-9301-8eef1801e54d","title":"DemoFLP","tileTitle":"Title","tile_type":"chips.tiles.applauncher.StaticTile"},{"id":"7dc725a1-97a6-45f8-a542-17aa6aabf55f","title":"DemoFLP","tileTitle":"Title","tile_type":"chips.tiles.applauncher.StaticTile"},{"id":"ff96d1be-4327-4f1a-ae77-dbea85b742a1","title":"Carriers","tileTitle":"Carrier","tile_type":"chips.tiles.applauncherdynamic.DynamicTile"},{"id":"8176c71b-f858-4a04-bee0-7a73644c4f8a","title":"DemoFLP25","tileTitle":"Title","tile_type":"chips.tiles.applauncher.StaticTile"}]},{"id":"6e42bd4f-c482-41ac-9b96-cca10e2ce743-1422263434881","type":"CATEGORY","title":"Gilboa Category","description":"Created by Michal","created":"2015-01-26 00:00:00.000000000","created_by":"I059286","updated":"2015-01-26 00:00:00.000000000","assignedApps":[{"id":"5a5fccf5-75df-4be1-884d-55026f810c42","title":"babureg","tileTitle":"vesty","tile_type":"chips.tiles.applauncher.StaticTile"},{"id":"cac4b781-bc6c-48de-9903-6f9f5827cced","title":"impdepit","tileTitle":"Title","tile_type":"chips.tiles.applauncher.StaticTile"},{"id":"8c2e55c6-1081-4aaa-9f83-fc506b3af2b7","title":"deploy","tileTitle":"please","tile_type":"chips.tiles.applauncher.StaticTile"},{"id":"e2080668-5010-48cc-8c70-1ff1db2f20e2","title":"impdepit","tileTitle":"Title","tile_type":"chips.tiles.applauncher.StaticTile"},{"id":"58d76a0d-2746-4d27-ab6c-9903ed8c6ce3","title":"impdepit","tileTitle":"Title","tile_type":"chips.tiles.applauncher.StaticTile"},{"id":"f73b658d-8997-4b5a-8eb0-817792b69860","title":"impdepit","tileTitle":"Title","tile_type":"chips.tiles.applauncher.StaticTile"},{"id":"4cc2f937-ee15-4ded-ad47-9ba125558414","title":"batata","tileTitle":"Title","tile_type":"chips.tiles.applauncher.StaticTile"},{"id":"3ff4b727-620f-48cd-9bc4-1b2e3023ba24","title":"firastempextension1","tileTitle":"Title","tile_type":"chips.tiles.applauncher.StaticTile"},{"id":"a56e1c35-8b3e-4c1a-a2ef-4a086a5b38d6","title":"firastempextension1","tileTitle":"Titlesas","tile_type":"chips.tiles.applauncher.StaticTile"},{"id":"87cd3ff4-b499-431c-a723-f5488f6e3590","title":"firastempextension1","tileTitle":"Titlesasasa","tile_type":"chips.tiles.applauncher.StaticTile"},{"id":"a43226be-ebf5-4989-b1b5-ee689c073f7e","title":"firastempextension1","tileTitle":"Titlesasas","tile_type":"chips.tiles.applauncher.StaticTile"},{"id":"def69847-eb32-4397-a824-d026cfccc737","title":"firastempextension1","tileTitle":"sasaTitle","tile_type":"chips.tiles.applauncher.StaticTile"},{"id":"42341d10-eb89-4136-916e-9bce4b4cc14c","title":"firastempextension1","tileTitle":"Title","tile_type":"chips.tiles.applauncher.StaticTile"},{"id":"f96929cd-3d4d-49e0-86cd-48099fbdf5ea","title":"firastempextension1","tileTitle":"saaaaaaaaaaaTitle","tile_type":"chips.tiles.applauncher.StaticTile"},{"id":"08fdf35d-bf2f-4235-b20d-f49220bf9cb1","title":"firastempextension1dsdsds","tileTitle":"Titlesasasasasa","tile_type":"chips.tiles.applauncher.StaticTile"},{"id":"6f6c0d8c-688c-495d-9540-6d0fb5780de4","title":"mive","tileTitle":"Title","tile_type":"chips.tiles.applauncher.StaticTile"},{"id":"07234519-d3c1-4364-97f4-78160d3d5812","title":"multivev","tileTitle":"myone","tile_type":"chips.tiles.applauncher.StaticTile"},{"id":"259942c3-5147-4c5e-982c-6081bfbe9864","title":"batata22","tileTitle":"batat222","tile_type":"chips.tiles.applauncher.StaticTile"},{"id":"3b6610bc-8bd6-4130-9a37-956bf5534402","title":"sd","tileTitle":"Title","tile_type":"chips.tiles.applauncher.StaticTile"},{"id":"0b7cf9a1-6481-4b5b-ac89-308f30b2e072","title":"batata","tileTitle":"Title","tile_type":"chips.tiles.applauncher.StaticTile"},{"id":"174c0732-1974-4054-bc64-78e555ec915f","title":"batata","tileTitle":"batatatattata","tile_type":"chips.tiles.applauncher.StaticTile"},{"id":"4750db62-12df-4696-bd22-cf867d606a65","title":"sd","tileTitle":"Title","tile_type":"chips.tiles.applauncher.StaticTile"},{"id":"add7b944-b3d9-434b-82b5-62e550e05c3a","title":"firastempExtension","tileTitle":"FirasTempExtension","tile_type":"chips.tiles.applauncher.StaticTile"},{"id":"dd556b28-5d3f-4231-9598-9a09aab51c49","title":"FirasBlaBlaExtension","tileTitle":"Firas Bla Bla Extension","tile_type":"chips.tiles.applauncher.StaticTile"},{"id":"c5eeb8de-2cf5-48d5-9a37-a016cf3eeaea","title":"regiver","tileTitle":"Title","tile_type":"chips.tiles.applauncher.StaticTile"},{"id":"37739325-ee8b-4f0a-bb3d-dc23f360b63a","title":"Zaza","tileTitle":"Zaza Title","tile_type":"chips.tiles.applauncher.StaticTile"}]}]}
		var sCategories = JSON.stringify(oCategories);
		// mock content packages
		var oContentPackages = {"items":[{"id":"5d63b7f9-d0bf-444d-85b4-981a24039ffd-1422263471350","title":"Default Content Package","description":"Default content package created by Michal","assignedRoles":[],"assignedApps":[{"id":"a4194154-3e5b-48a6-8417-bee3ae6ef618","title":"DemoFLPExtension2"},{"id":"7220d827-a8f0-4011-9116-c183f18050e8","title":"MyFlights"},{"id":"66b8c9cc-87f6-46c1-a2d8-4519c98e3216","title":"Newflp"},{"id":"0b7cf9a1-6481-4b5b-ac89-308f30b2e072","title":"batata"},{"id":"d8251a31-9885-449d-bfbd-442acdf53729","title":"batata"},{"id":"66430ef3-acfc-4e0d-9fe8-be7bf8af5fb7","title":"regiver"},{"id":"a9558a12-4e96-43ff-bc37-58ae65ae6cc0","title":"regiver"},{"id":"c8dd0c77-55de-4005-bd99-681d377a7c88","title":"batata"},{"id":"01d092da-d703-4378-b890-6880109c9632","title":"batata"},{"id":"174c0732-1974-4054-bc64-78e555ec915f","title":"batata"},{"id":"b24a5ec2-92f9-41a9-ac39-6123c6da7f6a","title":"wyz"},{"id":"f96929cd-3d4d-49e0-86cd-48099fbdf5ea","title":"firastempextension1"},{"id":"5363cd6a-34b6-44c4-950e-5e7d5924d5d7","title":"batata"},{"id":"65f57765-717e-4fa3-9f14-a63d445a9d09","title":"firastempextension1"},{"id":"5ff7d513-3108-4665-b80b-c7399c6c1e26","title":"demoappExtension1"},{"id":"5e9270c9-355e-4120-b781-5eb5ec4d0ce2","title":"wyz"},{"id":"987d8236-c87a-4082-9fad-f9e4aefc1749","title":"wyz"},{"id":"1611b7aa-956b-4565-8e0f-396d15a8761e","title":"wyz"},{"id":"656b52f1-6a3d-4594-99ee-7e9ac3b30730","title":"test222extension"},{"id":"a3331199-d697-4bd7-9e2c-8ac087422de5","title":"firastempExtension"},{"id":"5451d123-d675-4186-8fe9-4ef2dfc8547c","title":"firastempextension1Batabata"},{"id":"f5b3244c-ea46-4c12-99b9-d1b8ae05ddc7","title":"vereddeployrun"},{"id":"b8147608-7dcf-45c5-846c-e8910a8bdfd2","title":"vereddeployrun"},{"id":"8e3f1cc7-f8b3-47f7-a888-af5bbc1d9355","title":"vereddeployrun"},{"id":"27d570d3-3476-462c-976e-f6aaeab1ac03","title":"vereddeployrun"},{"id":"65d88aaf-d0a1-4e74-8445-bfb2d636db9f","title":"Flights"},{"id":"2546c2ff-f480-4fa8-9a17-e375f1600164","title":"TestDep1"},{"id":"58bc265b-4d94-49ca-84d8-12136b6c4506","title":"MichalTest2"},{"id":"1a81a75a-a8be-4cd2-9bd5-c600ce0b7405","title":"MichalTest3"},{"id":"fa4a2468-502d-425c-8c21-aac3194bd88d","title":"DemoFLP"},{"id":"8176c71b-f858-4a04-bee0-7a73644c4f8a","title":"DemoFLP25"},{"id":"ff96d1be-4327-4f1a-ae77-dbea85b742a1","title":"Carriers"},{"id":"6f4fad8b-71e9-4612-817b-951f10d1cbbd","title":"DemoFLPExtension2"},{"id":"e1bd8479-c98c-4518-9460-eb5afce6aee3","title":"demoflp1Extension1"},{"id":"41fe3292-6950-4ce9-b5eb-72c3a0a831c6","title":"demoflp1"},{"id":"779c48e9-8584-4f69-a01c-2ea74e826dc1","title":"DemoFLP"},{"id":"468e5668-80d2-4642-9053-a42cf27cee20","title":"DemoFLP"},{"id":"e157d670-11d3-4d96-8783-5e92d0231cea","title":"DemoFLP"},{"id":"c652e8cf-6d64-4445-a6ea-e2687b950573","title":"DemoFLP"},{"id":"7dc725a1-97a6-45f8-a542-17aa6aabf55f","title":"DemoFLP"},{"id":"f1ffcda3-9d23-4618-9301-8eef1801e54d","title":"DemoFLP"}]},{"id":"f197bf51-1e43-47cc-8759-f160fc75a71b-1422263490211","title":"Gilboa Content Package","description":"Created by Michal","assignedRoles":[],"assignedApps":[{"id":"37739325-ee8b-4f0a-bb3d-dc23f360b63a","title":"Zaza"},{"id":"259942c3-5147-4c5e-982c-6081bfbe9864","title":"batata22"},{"id":"dd556b28-5d3f-4231-9598-9a09aab51c49","title":"FirasBlaBlaExtension"},{"id":"add7b944-b3d9-434b-82b5-62e550e05c3a","title":"firastempExtension"},{"id":"08fdf35d-bf2f-4235-b20d-f49220bf9cb1","title":"firastempextension1dsdsds"},{"id":"3b6610bc-8bd6-4130-9a37-956bf5534402","title":"sd"},{"id":"8c2e55c6-1081-4aaa-9f83-fc506b3af2b7","title":"deploy"},{"id":"5a5fccf5-75df-4be1-884d-55026f810c42","title":"babureg"},{"id":"4750db62-12df-4696-bd22-cf867d606a65","title":"sd"},{"id":"cac4b781-bc6c-48de-9903-6f9f5827cced","title":"impdepit"},{"id":"07234519-d3c1-4364-97f4-78160d3d5812","title":"multivev"},{"id":"6f6c0d8c-688c-495d-9540-6d0fb5780de4","title":"mive"},{"id":"c5eeb8de-2cf5-48d5-9a37-a016cf3eeaea","title":"regiver"},{"id":"42341d10-eb89-4136-916e-9bce4b4cc14c","title":"firastempextension1"},{"id":"def69847-eb32-4397-a824-d026cfccc737","title":"firastempextension1"},{"id":"a43226be-ebf5-4989-b1b5-ee689c073f7e","title":"firastempextension1"},{"id":"87cd3ff4-b499-431c-a723-f5488f6e3590","title":"firastempextension1"},{"id":"a56e1c35-8b3e-4c1a-a2ef-4a086a5b38d6","title":"firastempextension1"},{"id":"3ff4b727-620f-48cd-9bc4-1b2e3023ba24","title":"firastempextension1"},{"id":"4cc2f937-ee15-4ded-ad47-9ba125558414","title":"batata"},{"id":"f73b658d-8997-4b5a-8eb0-817792b69860","title":"impdepit"},{"id":"58d76a0d-2746-4d27-ab6c-9903ed8c6ce3","title":"impdepit"},{"id":"e2080668-5010-48cc-8c70-1ff1db2f20e2","title":"impdepit"}]}]}
		var sContentPackages = JSON.stringify(oContentPackages);

		before(function () {
			var loadWebIdePromise = STF.startWebIde(suiteName, {config : "extensibility/config.json"});
			return loadWebIdePromise.then(function (_iFrameWindow) {
				iFrameWindow = _iFrameWindow;
				// get services
				oFioriLaunchpadService = STF.getService(suiteName, "fiorilaunchpad");
				oFakeFileDAO = STF.getService(suiteName, "fakeFileDAO");
				oFileSystemService = STF.getService(suiteName, "filesystem.documentProvider");

				// prepare dummy input
				oModel = {
					"name" : "dummyTitle",
					"description" : "dummyDescription",
					"intent" : [{
						"semanticObject" : "dummySemanticObject",
						"action" : "dummyAction"
					}],
					"hcpAppName" : "dummyHcpAppName",
					"selectedGroups" : [],
					"selectedCategories" : [],
					"selectedcontentPackages" : [],
					"selectedTiletype" : "StaticTile",
					"title" : "dummyTitle",
					"subtitle" : "dummySubtitle",
					"icon" : "dummyIconUrl"
				};

				sProviderName = "dummyProviderName";

				oProjectJson = {
					"extensibility": {
						"controllers": {
							"App": "/appName/view/App.controller.js",
							"NotFound": "/appName/view/NotFound.controller.js",
							"Master": "/appName/view/Master.controller.js",
							"Detail": "/appName/view/Detail.controller.js"
						},
						"views": {
							"Master": "/appName/view/Master.view.xml",
							"NotFound": "/appName/view/NotFound.view.xml",
							"Detail": "/appName/view/Detail.view.xml",
							"App": "/appName/view/App.view.xml"
						},
						"fragments": {},
						"type": "Workspace",
						"component": "/appName/Component.js",
						"parentResourceRootUrl": "../appName",
						"namespace": "myns",
						"resourceBundle": "i18n/messageBundle.properties"
					}
				};

				var sExtensionProjectComponent = 'jQuery.sap.declare("myns.md4Extension1.Component");\n\
											// use the load function for getting the optimized preload file if present\n\
											sap.ui.component.load({\n\
												name: "myns",\n\
												// Use the below URL to run the extended application when SAP-delivered application located in a local cloud environment:\n\
												//url: jQuery.sap.getModulePath("myns.appname") + "/../../md4"\n\
												// Use the below url to run the extended application when SAP-delivered application located in a cloud environment:\n\
												url: jQuery.sap.getModulePath("myns.appname") + "/../orion/file/x2a4336b4$I060640-OrionContent/md4"\n\
												// we use a URL relative to our own component\n\
												// extension application is deployed with customer namespace\n\
											});\n\
											this.myns.Component.extend("myns.appname.Component", {\n\
												metadata: {\n\
													version: "1.0",\n\
													config: {},\n\
													customizing: {}\n\
												}\n\
											});';

				// prepare fake file structure
				oFileStructure = {
					"appName" : {
						"Component.js" : sExtensionProjectComponent,
						".project.json" : JSON.stringify(oProjectJson)
					}
				};

				// regex for finding flp subscriptions
				var regex1 = /flp\w*\/fiori\/v1/;
				// regex for finding flpsandbox subscription
				var regex2 = /flpsandbox\w*\/fiori\/v1/;

				// prepare mock server
				iFrameWindow.jQuery.sap.require("sap.ui.app.MockServer");
				oMockServer = new iFrameWindow.sap.ui.core.util.MockServer({
					rootUri: "",
					requests: [{
						method: "GET",
						// mock the call to get the CSRF token
						path: new iFrameWindow.RegExp(".*/groups/site/DEFAULT.*"),
						response: function (oXhr) {
							oXhr.respond(200, {
									"Content-Type": "application/octet-stream"
								},
								"true");
							}
						},{
							method: "POST",
							// mock the call to register the application
							path: new iFrameWindow.RegExp(".*/fiori/flp/designer/v1/descriptor.*"),
							response: function (oXhr) {
								oXhr.respond(200, {
									"Content-Type": "application/octet-stream"
								},
								"/dummy/appUrl");
							}
						},{
							method: "GET",
							// mock the call for isAdmin - returns "true" if the subscription name contains "flp"
							path: new iFrameWindow.RegExp(".*/fiori/v1/neoRoles/isAdmin.*"),
							response: function (oXhr) {
								if (regex1.test(oXhr.url)) {
									oXhr.respond(200, {
										"Content-Type": "application/octet-stream"
									}, "true");
								} else {
									oXhr.respond(404, {
										"Content-Type": "application/octet-stream"
									}, "");
								}
							}
						},{
							method: "GET",
							// mock the call that checks if a certain app is already registered to any FLP subscription
							path: new iFrameWindow.RegExp(".*/v1/designer/v1/apps/getHtml5.*"),
							response: function (oXhr) {
								// respond as if the application is only registered to "flpsandbox"
								if (regex2.test(oXhr.url)) {
									oXhr.respond(200, {
										"Content-Type": "application/octet-stream"
									}, "true");
								} else {
									oXhr.respond(404, {
										"Content-Type": "application/octet-stream"
									}, "");
								}
							}
						},{
							method: "GET",
							// mock the call to get sites
							path: new iFrameWindow.RegExp(".*/flp/runtime/v1/sites.*"),
							response: function (oXhr) {
								oXhr.respond(200, {
									"Content-Type": "application/octet-stream"
								}, sSites);
							}
						},{
							method: "GET",
							// mock the call to get groups
							path: new iFrameWindow.RegExp(".*/groups/site/.*"),
							response: function (oXhr) {
								oXhr.respond(200, {
									"Content-Type": "application/octet-stream"
								}, sGroups);
							}
						},{
							method: "GET",
							// mock the call to get categories
							path: new iFrameWindow.RegExp(".*/categories.*"),
							response: function (oXhr) {
								oXhr.respond(200, {
									"Content-Type": "application/octet-stream"
								},
								sCategories);
							}
						},{
							method: "GET",
							// mock the call to get content packages
							path: new iFrameWindow.RegExp(".*/content_packages.*"),
							response: function (oXhr) {
								oXhr.respond(200, {
									"Content-Type": "application/octet-stream"
								},
								sContentPackages);
							}
						}]
					});

				oMockServer.start();
			});
		});

		it('Registers an application', function () {

			return oFakeFileDAO.setContent(oFileStructure).then(function() {
				return oFileSystemService.getDocument("/appName").then(function(oProjectDocument) {
					return oFioriLaunchpadService.register(oModel, oProjectDocument, sProviderName).then(function(oResult) {
						expect(oResult.status).to.equal(true);
						expect(oResult.appUrl).to.equal("/dummy/appUrl");
					});
				});
			});
		});

		it("Tests getAllFioriProviderAccounts method", function () {

			// prepare 4 dummy subscriptions - 2 of them are flp
			var oDummySubscription1 = {
				activeVersion: "1.17.0-SNAPSHOT-30092015125303",
				displayName: "devfactory",
				name: "devfactory",
				providerAccount: "sapwebidetest",
				providerName: "devfactory",
				startedVersion: "1.17.0-SNAPSHOT-30092015125303",
				status: "STARTED",
				url: "https://devfactory-x2a4336b4.dispatcher.neo.ondemand.com"
			};

			var oDummySubscription2 = {
				activeVersion: "20150930_034439",
				displayName: "flpdevelopment",
				name: "flpdevelopment",
				providerAccount: "odp",
				providerName: "flpdevelopment",
				startedVersion: "20150930_034439",
				status: "STARTED",
				url: "https://flpdevelopment-x2a4336b4.dispatcher.neo.ondemand.com"
			};

			var oDummySubscription3 = {
				activeVersion: "08.09.build-47",
				displayName: "flpsandbox",
				name: "flpsandbox",
				providerAccount: "odp",
				providerName: "flpsandbox",
				startedVersion: "08.09.build-47",
				status: "STARTED",
				url: "https://flpsandbox-x2a4336b4.dispatcher.neo.ondemand.com"
			};

			var oDummySubscription4 = {
				activeVersion: "1.17.0-SNAPSHOT-30092015125142",
				displayName: "devint",
				name: "devint",
				providerAccount: "sapwebidetest",
				providerName: "devint",
				startedVersion: "1.17.0-SNAPSHOT-30092015125142",
				status: "STARTED",
				url: "https://devint-x2a4336b4.dispatcher.neo.ondemand.com"
			};

			var aDummySubscriptions = [oDummySubscription1, oDummySubscription2, oDummySubscription3, oDummySubscription4];

			return oFioriLaunchpadService.getAllFioriProviderAccounts(aDummySubscriptions).then(function(oFlpSubscriptions1) {
				expect(oFlpSubscriptions1).to.exist;
				expect(oFlpSubscriptions1.length).to.equal(2); // only 2 flp subscriptions

				aDummySubscriptions = []; // no flp subscriptions
				return oFioriLaunchpadService.getAllFioriProviderAccounts(aDummySubscriptions).then(function(oFlpSubscriptions2) {
					expect(oFlpSubscriptions2).to.exist;
					expect(oFlpSubscriptions2.length).to.equal(0); // no flp subscriptions

					aDummySubscriptions = [oDummySubscription1, oDummySubscription4]; // no flp subscriptions
					return oFioriLaunchpadService.getAllFioriProviderAccounts(aDummySubscriptions).then(function(oFlpSubscriptions3) {
						expect(oFlpSubscriptions3).to.exist;
						expect(oFlpSubscriptions3.length).to.equal(0); // no flp subscriptions
					});
				});
			});
		});

		it("Tests getHtml5App method", function () {

			var oDummyFlpSubscription1 = {
				activeVersion: "08.09.build-47",
				displayName: "flpsandbox",
				name: "flpsandbox",
				providerAccount: "odp",
				providerName: "flpsandbox",
				startedVersion: "08.09.build-47",
				status: "STARTED",
				url: "https://flpsandbox-x2a4336b4.dispatcher.neo.ondemand.com"
			};

			var oDummyFlpSubscription2 = {
				activeVersion: "20150930_034439",
				displayName: "flpdevelopment",
				name: "flpdevelopment",
				providerAccount: "odp",
				providerName: "flpdevelopment",
				startedVersion: "20150930_034439",
				status: "STARTED",
				url: "https://flpdevelopment-x2a4336b4.dispatcher.neo.ondemand.com"
			};

			var aFlpSubscriptions = [oDummyFlpSubscription1, oDummyFlpSubscription2];
			var deployedAppName = "DummyApp";
			var username = "dummyUser";
			var password = "dummyPassword";

			return oFioriLaunchpadService.getHtml5App(aFlpSubscriptions, deployedAppName, username, password).then(function(aAppDetails1) {
				expect(aAppDetails1).to.exist;
				expect(aAppDetails1.length).to.equal(1); // only registered to flpsandbox subscription

				aFlpSubscriptions = [oDummyFlpSubscription2];
				return oFioriLaunchpadService.getHtml5App(aFlpSubscriptions, deployedAppName, username, password).then(function(aAppDetails2) {
					expect(aAppDetails2).to.exist;
					expect(aAppDetails2.length).to.equal(0); // only registered to flpsandbox subscription
				});
			});
		});

		it("Tests getSites method", function () {
			var sDummyProviderName = "sapflp3";
			return oFioriLaunchpadService.getSites(sDummyProviderName).then(function(sResult) {
				expect(sResult).to.equal(sSites);
			});
		});
		
		it("Tests getGroups method", function () {

			var sDummyProviderName = "sapflp3";
			return oFioriLaunchpadService.getGroups(sDummyProviderName,"DEFAULT").then(function(sResult) {
				expect(sResult).to.equal(sGroups);
			});
		});

		it("Tests getCategories method", function () {

			var sDummyProviderName = "sapflp3";
			return oFioriLaunchpadService.getCategories(sDummyProviderName).then(function(sResult) {
				expect(sResult).to.equal(sCategories);
			});
		});

		it("Tests getContentPackages method", function () {

			var sDummyProviderName = "sapflp3";
			return oFioriLaunchpadService.getContentPackages(sDummyProviderName,"DEFAULT").then(function(sResult) {
				expect(sResult).to.equal(sContentPackages);
			});
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
			oMockServer.stop();
			oMockServer.destroy();
		});
	});
	
	describe('FioriLaunchpad Service - Unit tests', function () {
		
		var oFakeFileDAO;
		var oFileSystemService;
		var oRequiredFLPLaunchpad;
		
		before(function() {
			return STF.startWebIde(suiteName, {config : "extensibility/config.json"}).then(function () {
				// get services
				oFakeFileDAO = STF.getService(suiteName, "fakeFileDAO");
				oFileSystemService = STF.getService(suiteName, "filesystem.documentProvider");
				// override sap.watt.getEnv method
				sap.watt.getEnv = function() {
					return "dummy output";	
				};
			});
		});

		beforeEach(function () {
			return coreQ.sap.require("sap/watt/saptoolsets/fiori/hcp/plugin/fiorilaunchpad/services/FioriLaunchpad").then(function(FLPLaunchpad) {
				oRequiredFLPLaunchpad = new FLPLaunchpad();
				
				oRequiredFLPLaunchpad.context = {};
				oRequiredFLPLaunchpad.context.service = {};
				oRequiredFLPLaunchpad.context.service.builder = {};
				oRequiredFLPLaunchpad.context.service.builder.isBuildSupported = function() {
					return Q(true);
				};
				oRequiredFLPLaunchpad.context.service.filesystem = {};
				oRequiredFLPLaunchpad.context.service.filesystem.documentProvider = {};
				oRequiredFLPLaunchpad.context.service.filesystem.documentProvider.getDocument = function(sPath) {
					var oDoc = {};
					oDoc.getLocalPath = function() {
						return sPath;	
					};
					return Q(oDoc);
				};
			});
		});
		
		afterEach(function () {
			oRequiredFLPLaunchpad = undefined;
		});
		
		after(function () {
			STF.shutdownWebIde(suiteName);
		});
		
		describe("Tests getComponentJsDocument method", function() {
			
			function testAndCheckResult(oFileStructure, sProjectName, bExists, sLocalPath) {
				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return oFileSystemService.getDocument(sProjectName).then(function(oProjectDocument) {
						return oRequiredFLPLaunchpad.getComponentJsDocument(oProjectDocument).then(function(oComponentDoc) {
							if (bExists) {
								expect(oComponentDoc).to.exist;
							} else {
								expect(oComponentDoc).to.not.exist; // undefined
							}
							
							if (sLocalPath) {
								expect(oComponentDoc.getLocalPath()).to.equal(sLocalPath);
							}
						});
					});
				});
			}
			
			it("There's no Component.js in the project and no build target folder", function () {
	
				var oFileStructure = {
					"App1" : {
						"webapp": {}
					}
				};
				
				// override the getTargetFolder method impl
				oRequiredFLPLaunchpad.context.service.builder.getTargetFolder = function() {
					return Q(); // undefined
				};
				
				return testAndCheckResult(oFileStructure, "/App1", false);
			});
			
			it("With Component.js in the project, no build target folder", function () {
	
				var oFileStructure = {
					"App2" : {
						"webapp": {
							"Component.js" : "some dummy component content"
						}
					}
				};
				
				// override the getTargetFolder method impl
				oRequiredFLPLaunchpad.context.service.builder.getTargetFolder = function() {
					return Q(); // undefined
				};
				
				return testAndCheckResult(oFileStructure, "/App2", true, "/App2/webapp/Component.js");
			});
			
			it("With build target folder but Component.js is not in it", function () {
				var oBuildTargetFolder;
				
				var oFileStructureForBuild = {
						"BuildTargetFolder" : {
						"SomeFile" : "bla bla"
					}
				};
				
				return oFakeFileDAO.setContent(oFileStructureForBuild).then(function() {
					return oFileSystemService.getDocument("/BuildTargetFolder").then(function(oTargetFolder) {
						oBuildTargetFolder = oTargetFolder;
						
						var oFileStructure = {
							"App3" : {
								"webapp": {},
								"BuildTargetFolder": {},
								"FolderWithComponent": {
									"Component.js" : "some dummy component content"
								}
							}
						};
						
						// override the getTargetFolder method impl
						oRequiredFLPLaunchpad.context.service.builder.getTargetFolder = function() {
							return Q(oBuildTargetFolder);
						};
						
						return testAndCheckResult(oFileStructure, "/App3", true, "/App3/FolderWithComponent/Component.js");
					});
				});
			});
			
			it("With build target folder and the Component.js is in it", function () {
	
				var oFileStructure = {
					"App4" : {
						"webapp": {},
						"BuildTargetFolder": {
							"Component.js" : "some dummy component content"
						}
					}
				};
				
				// override the getTargetFolder method impl
				oRequiredFLPLaunchpad.context.service.builder.getTargetFolder = function() {
					var oFileStructureForBuild = {
						"BuildTargetFolder" : {
							"Component.js" : "some dummy component content"
						}
					};
					
					return oFakeFileDAO.setContent(oFileStructureForBuild).then(function() {
						return oFileSystemService.getDocument("/BuildTargetFolder").then(function(oTargetFolder) {
							return oTargetFolder;
						});
					});
				};
				
				return testAndCheckResult(oFileStructure, "/App4", true, "/BuildTargetFolder/Component.js");
			});
			
			it("The project isn't buildable but Component.js exists", function () {
	
				var oFileStructure = {
					"App5" : {
						"webapp": {
							"Component.js" : "some dummy component content"
						}
					}
				};
				
				// override the isBuildSupported method impl
				oRequiredFLPLaunchpad.context.service.builder.isBuildSupported = function() {
					return Q(false);
				};
				
				return testAndCheckResult(oFileStructure, "/App5", true, "/App5/webapp/Component.js");
			});
			
			it("The project isn't buildable and there's no Component.js", function () {
	
				var oFileStructure = {
					"App6" : {
						"webapp": {}
					}
				};
				
				// override the isBuildSupported method impl
				oRequiredFLPLaunchpad.context.service.builder.isBuildSupported = function() {
					return Q(false);
				};
				
				return testAndCheckResult(oFileStructure, "/App6", false);
			});
		});
	});
});