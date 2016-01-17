/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
jQuery.sap.declare("sap.apf.core.messageDefinition");

sap.apf.core.messageDefinition = [
    {
        code: "3001",
        severity: "technError",
        text: "Text is not available for the following key: {0}"
    },
    {
        code: "5001",
        severity: "technError",
        text: "Request {3} to server failed with http status code {0}, http error message {1}, and server response {2}."
    },
    {
        code: "5002",
        severity: "error",
        description: "Error in OData request; update of analysis step {0} failed.",
        key: "5002"
    },
    {
        code: "5004",
        severity: "fatal",
        description: "Request with ID {0} does not exist in the analytical content configuration.",
        key: "5004"
    },
    {
        code: "5005",
        severity: "technError",
        text: "Required property {1} is missing in the filter of the OData request for entity type {0}."
    },
    {
        code: "5006",
        severity: "technError",
        text: "Inconsistency in data model; non-filterable property {1} is set as required filter for entity type {0}."
    },
    {
        code: "5015",
        severity: "fatal",
        description: "Service for request {0} is not defined in the analytical content configuration.",
        key: "5015"
    },
    {
        code: "5016",
        severity: "technError",
        text: "Mandatory parameter key property {0} is missing in filter."
    },
    {
        code: "5018",
        severity: "fatal",
        description: "Metadata request {0} failed.",
        key: "5018"
    },
    {
        code: "5019",
        severity: "technError",
        text: "System query option $orderby for property {1} removed from OData request for entity type {0}."
    },
    {
        code: "5020",
        severity: "fatal",
        description: "Analytical content configuration is not available.",
        key: "5020"
    },
    {
        code: "5021",
        severity: "error",
        description: "Error during server request; session timeout occurred.",
        key: "5021"
    },
    {
    	code: "5022",
    	severity: "fatal",
    	description: "Analytical configuration with ID {0} is not available.",
    	key: "5022"
    },
    {
    	code: "5023",
    	severity: "fatal",
    	description: "Texts could not be loaded for Analytical configuration with ID {0}.",
    	key: "5023"
    },
    {
    	code: "5024",
    	severity: "fatal",
    	description: "URL Parameter for Analytical Configuration ID must contain the ID of the application and the ID of the Analytical configuration seperated by a dot.",
    	key: "5024"
    },
    {
        code: "5025",
        severity: "fatal",
        description: "Value for SAP client has not been provided at startup of the application.",
        key: "5025"
    },
    {
        code: "5026",
        severity: "fatal",
        description: "Logical system cannot be determined for SAP client {0}. ",
        key: "5026"
    },
    {
        code: "5027",
        severity: "technError",
        text: "Inconsistent parameters; analysis path cannot be saved. Path ID: {0}, path name: {1}, callback function {2}"
    },
    {
        code: "5028",
        severity: "technError",
        text: "Binding with ID {0} contains a representation without ID."
    },
    {
        code: "5029",
        severity: "technError",
        text: "Binding with ID {0} contains a duplicated representation ID."
    },
    {
        code: "5030",
        severity: "technError",
        text: "Constructor property of representation type ID {0} does not contain a module path to a valid function."
    },
    {
        code: "5031",
        severity: "technError",
        text: "Argument for method 'setApplicationMessageCallback' is not a function."
    },
    {
        code: "5032",
        severity: "technError",
        text: "System query option {1} unknown in request for entity type {0}."
    },
    {
        code: "5033",
        severity: "technError",
        text: "Unsupported type {0} in configuration object provided."
    },
    {
        code: "5034",
        severity: "technError",
        text: "Facet filter configuration attribute 'property' missing."
    },
    {
        code: "5035",
        severity: "technError",
        text: "Function module path contained in property preselectionFuntion of facet filter ID {0} does not contain a valid function."
    },
    {
    	code: "5036",
    	severity: "technError",
    	text: "Start paramater step id {0} is not existing."
    },
    {
    	code: "5037",
    	severity: "technError",
    	text: "Start paramater representation id {0} is not existing."
    },
    {
    	code: "5038",
    	severity: "technError",
    	text: "Environment for sap.ushell.Container is not existing."
    },
    {
    	code: "5039",
    	severity: "technError",
    	text: "Error while pushing content to the ushell container"
    },
    {
    	code: "5040",
    	severity: "technError",
    	text: "Error while fetching content from the ushell container"
    },
    {
        code: "5100",
        severity: "fatal",
        description: "Unexpected internal error: {0}. Contact SAP.",
        key: "5100"
    },
    {
        code: "5101",
        severity: "technError",
        text: "Unexpected internal error: {0}. Contact SAP."
    },
    {
        code: "5102",
        severity: "fatal",
        description: "Wrong definition in analytical content configuration: {0}",
        key: "5102"
    },
    {
        code: "5103",
        severity: "technError",
        text: "Wrong definition in analytical content configuration."
    },
    {
        code: "5104",
        severity: "technError",
        text: "Wrong filter mapping definition in analytical content configuration"
    },
    {
        code: "5200",
        severity: "technError",
        text: "Server error during processing of path: {0} {1}"
    },
    {
        code: "5201",
        severity: "error",
        description: "Unknown server error.",
        key: "5201"
    },
    {
        code: "5202",
        severity: "technError",
        text: "Persistence service call returned '405 - Method not allowed'."
    },
    {
        code: "5203",
        severity: "technError",
        text: "Bad request; data is structured incorrectly."
    },
    {
        code: "5204",
        severity: "error",
        description: "Error during server request; maximum number of analysis steps exceeded.",
        key: "5204"
    },
    {
        code: "5205",
        severity: "error",
        description: "Error during server request; maximum number of analysis paths exceeded.",
        key: "5205"
    },
    {
        code: "5206",
        severity: "error",
        description: "Access forbidden; insufficient privileges",
        key: "5206"
    },
    {
        code: "5207",
        severity: "error",
        description: "Inserted value too large; probably maximum length of analysis path name exceeded",
        key: "5207"
    },
    {
        code: "5208",
        severity: "error",
        description: "Error during path persistence; request to server can not be proceed due to invalid ID.",
        key: "5208"
    },
    {
        code: "5210",
        severity: "error",
        description: "Error during opening of analysis path; see log.",
        key: "5210"
    },
    {
        code: "5211",
        severity: "error",
        description: "Server response contains undefined path objects.",
        key: "5211"
    },
    {
        code: "5212",
        severity: "error",
        description: "Metadata file of application {0} could not be accessed.",
        key: "5212"
    },
    {
        code: "5213",
        severity: "error",
        description: "Text file of application {0} could not be accessed.",
        key: "5213"
    },
    {
        code: "5300",
        severity: "fatal",
        description: "You must log out of the application due to a critical error.",
        key: "5300"
    },
    {
        code: "6001",
        severity: "fatal",
        description: "Missing {0} in the configuration; contact your administrator.",
        key: "6001"
    },
    {
        code: "6000",
        severity: "error",
        description: "Data is not available for the {0} step.",
        key: "6000"
    },
    {
        code: "6002",
        severity: "error",
        description: "Missing {0} for {1} in the configuration; contact your administrator.",
        key: "6002"
    },
    {
        code: "6003",
        severity: "error",
        description: "Missing {0} in the configuration; contact your administrator.",
        key: "6001"
    },
    {
        code: "6004",
        severity: "technError",
        text: "Metadata not available for step {0}."
    },
    {
        code: "6005",
        severity: "error",
        description: "Server request failed. Unable to read paths.",
        key: "6005"
    },
    {
        code: "6006",
        severity: "error",
        description: "Server request failed. Unable to save path {0}.",
        key: "6006"
    },
    {
        code: "6007",
        severity: "error",
        description: "Server request failed. Unable to update path {0}.",
        key: "6007"
    },
    {
        code: "6008",
        severity: "error",
        description: "Server request failed. Unable to open path {0}.",
        key: "6008"
    },
    {
        code: "6009",
        severity: "error",
        description: "Server request failed. Unable to delete path {0}.",
        key: "6009"
    },
    {
        code: "6010",
        severity: "technError",
        description: "Data is not available for filter {0}",
        key: "6010"
    },
    {
        code: "6011",
        severity: "fatal",
        description: "Smart Business service failed.Please try later",
        key: "6011"
    },
    {
        code: "7000",
        severity: "error",
        description: "Missing {0} in the configuration; contact your administrator.",
        key: "6001"
    }
];
