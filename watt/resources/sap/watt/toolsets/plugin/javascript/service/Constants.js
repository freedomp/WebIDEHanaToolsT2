define([], function() {
	return {
		workerState: {
			"ready": "ready",
			"error": "error",
			"successComputeProposals": "successComputeProposals",
			"successComputeSummary": "successComputeSummary",
			"libraryAdded": "libraryAdded"
		},

		workerAction: {
			"start": "start",
			"computeProposals": "computeProposals",
			"computeHintProposals": "computeHintProposals",
			"addLibrary": "addLibrary",
			"computeSummary": "computeSummary"
		}
	};
});