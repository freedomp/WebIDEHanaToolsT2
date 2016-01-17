define(["sap/watt/ideplatform/backend/util/MetadataManager"], function (oMetadataManager) {
	
	"use strict";
	
	describe("Metadata Manager test", function() { 
		
		it("configure", function() {
	    	assert.ok(oMetadataManager.hasChildren(undefined) === false);
	    	assert.ok(oMetadataManager.hasChildren(null) === false);
	    	assert.ok(oMetadataManager.hasChildren("") === false);
		    assert.ok(oMetadataManager.hasChildren("project") === false);
		    assert.ok(oMetadataManager.hasChildren("/project") === false);
		    // create project with folder and file
		    var oProjectMetadata = {};
		    oProjectMetadata["/project"] = {name : "project1"};
		    oProjectMetadata["/project/folder"] = {name : "folder1"};
		    oProjectMetadata["/project/folder/file.txt"] = {name : "file.txt"};
		    oMetadataManager.setMetadata(oProjectMetadata);
		    assert.ok(oMetadataManager.hasChildren("/project") === true);
			assert.ok(oMetadataManager.hasChildren("/project/folder") === true);
		    assert.ok(oMetadataManager.hasChildren("/project/folder/file.txt") === false);
		});
		
		it("_getProjectPath", function() {
	    	assert.ok(oMetadataManager._getProjectPath(undefined) === undefined);
	    	assert.ok(oMetadataManager._getProjectPath(null) === undefined);
	    	assert.ok(oMetadataManager._getProjectPath("") === "");
		    assert.ok(oMetadataManager._getProjectPath("project") === undefined);
		    assert.ok(oMetadataManager._getProjectPath("/project") === "/project");
		    assert.ok(oMetadataManager._getProjectPath("/project/folder") === "/project");
		    assert.ok(oMetadataManager._getProjectPath("/project/folder/") === "/project");
		    assert.ok(oMetadataManager._getProjectPath("/project/folder/file.txt") === "/project");
		    assert.ok(oMetadataManager._getProjectPath("/project/folder/file.txt/") === "/project");
		});
	
		it("deleteMetadata", function() {
			// must not fail
		    assert.ok(oMetadataManager.deleteMetadata(undefined) === undefined);
		    assert.ok(oMetadataManager.deleteMetadata(null) === undefined);
		    assert.ok(oMetadataManager.deleteMetadata("project") === undefined);
		    assert.ok(oMetadataManager.deleteMetadata("/project") === undefined);
		    assert.ok(oMetadataManager.deleteMetadata("/project/folder") === undefined);
		    assert.ok(oMetadataManager.deleteMetadata("/project/folder/file.txt") === undefined);
		    // create project with folder and file and delete file
		    var oProjectMetadata = {};
		    oProjectMetadata["/project"] = {name : "project1"};
		    oProjectMetadata["/project/folder"] = {name : "folder1"};
		    oProjectMetadata["/project/folder/file.txt"] = {name : "file.txt"};
		    oMetadataManager.setMetadata(oProjectMetadata);
		    // delete file
		    oMetadataManager.deleteMetadata("/project/folder/file.txt");
		    assert.ok(oMetadataManager.getMetadata("/project/folder/file.txt") === undefined);
		    assert.ok(oMetadataManager.getMetadata("/project/folder").name === "folder1");
		    assert.ok(oMetadataManager.getMetadata("/project").name === "project1");
		    // create project with folder and file and delete folder
		    var oProjectMetadata = {};
		    oProjectMetadata["/project"] = {name : "project1"};
		    oProjectMetadata["/project/folder"] = {name : "folder1"};
		    oProjectMetadata["/project/folder/file.txt"] = {name : "file.txt"};
		    oMetadataManager.setMetadata(oProjectMetadata);
		    // delete folder
		    oMetadataManager.deleteMetadata("/project/folder", true);
		    assert.ok(oMetadataManager.getMetadata("/project/folder") === undefined);
		    assert.ok(oMetadataManager.getMetadata("/project/folder/file.txt") === undefined);
		    assert.ok(oMetadataManager.getMetadata("/project").name === "project1");
		    // create project with folder and file and delete project
		    var oProjectMetadata = {};
		    oProjectMetadata["/project"] = {name : "project1"};
		    oProjectMetadata["/project/folder"] = {name : "folder1"};
		    oProjectMetadata["/project/folder/file.txt"] = {name : "file.txt"};
		    oMetadataManager.setMetadata(oProjectMetadata);
		    // delete project
		    oMetadataManager.deleteMetadata("/project", true);
		    assert.ok(oMetadataManager.getMetadata("/project") === undefined);
		    assert.ok(oMetadataManager.getMetadata("/project/folder") === undefined);
		    assert.ok(oMetadataManager.getMetadata("/project/folder/file.txt") === undefined);
		});
		
		it("setMetadata", function() {
			// must pass without errors
		    assert.ok(oMetadataManager.setMetadata() === undefined);
		    assert.ok(oMetadataManager.setMetadata(null) === undefined);
		    // set with empty object
		    oMetadataManager.setMetadata({"/project" : {}});
		    assert.ok(oMetadataManager.getMetadata("/project") !== undefined);
		    oMetadataManager.deleteMetadata("/project");
		    assert.ok(oMetadataManager.getMetadata("/project") === undefined);
		    // set with non empty object
		    oMetadataManager.setMetadata({"/project/folder" : {"property1" : "value1"}});
		    assert.ok(oMetadataManager.getMetadata("/project/folder").property1 === "value1");
		    // check that object is updated
		    oMetadataManager.setMetadata({"/project/folder" : {"property1" : "value2"}});
		    assert.ok(oMetadataManager.getMetadata("/project/folder").property1 === "value2");
		    // add one more value
		    oMetadataManager.setMetadata({"/project/folder2" : {"property2" : "value3"}});
		    assert.ok(oMetadataManager.getMetadata("/project/folder2").property2 === "value3");
		    // add one project with folder
		    oMetadataManager.setMetadata({"/project2/folder" : {"property1" : "value4"}});
		    assert.ok(oMetadataManager.getMetadata("/project2/folder").property1 === "value4");
		    oMetadataManager.deleteMetadata("/project");
		});
	
		it("getMetadata", function() {
		    // must not fail
		    assert.ok(oMetadataManager.getMetadata(undefined) === undefined);
		    assert.ok(oMetadataManager.getMetadata(null) === undefined);
		    assert.ok(oMetadataManager.getMetadata("project") === undefined);
		    assert.ok(oMetadataManager.getMetadata("/project") === undefined);
		    assert.ok(oMetadataManager.getMetadata("/project/folder") === undefined);
		    assert.ok(oMetadataManager.getMetadata("/project/folder/file.txt") === undefined);
		    // create project with folder and file and get them one by one
		    var oProjectMetadata = {};
		    oProjectMetadata["/project"] = {name : "project1"};
		    oProjectMetadata["/project/folder"] = {name : "folder1"};
		    oProjectMetadata["/project/folder/file.txt"] = {name : "file.txt"};
		    oMetadataManager.setMetadata(oProjectMetadata);
		    // get project data
		    assert.ok(oMetadataManager.getMetadata("/project").name === "project1");
		    assert.ok(oMetadataManager.getMetadata("/project/folder").name === "folder1");
		    assert.ok(oMetadataManager.getMetadata("/project/folder/file.txt").name === "file.txt");
		    oMetadataManager.deleteMetadata("/project");
		});
	
		it("_getRootProjectsMetadata", function() {
		    // must not fail
		    assert.ok(oMetadataManager.getMetadata("") !== undefined);
		    // create project1 with folder and file
		    var oProjectMetadata = {};
		    oProjectMetadata["/project1"] = {name : "project1"};
		    oProjectMetadata["/project1/folder"] = {name : "folder1"};
		    oProjectMetadata["/project1/folder/file.txt"] = {name : "file.txt"};
		    oMetadataManager.setMetadata(oProjectMetadata);
		    // create project2 with folder and file
		    var oProjectMetadata2 = {};
		    oProjectMetadata2["/project2"] = {name : "project2"};
		    oProjectMetadata2["/project2/folder"] = {name : "folder2"};
		    oProjectMetadata2["/project2/folder/file.txt"] = {name : "file.txt"};
		    oMetadataManager.setMetadata(oProjectMetadata2);
		    // get root projects metadata
		    var oRootProjectsMetadata = oMetadataManager.getMetadata("");
		    var aProjectPathes = Object.keys(oRootProjectsMetadata);
		    assert.ok(aProjectPathes.length === 2);
		});
	});
});