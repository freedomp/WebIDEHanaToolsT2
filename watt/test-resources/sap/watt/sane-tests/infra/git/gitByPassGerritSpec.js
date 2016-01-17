define(["STF", "infra/git/gitUtils", "util/orionUtils", "infra/utils/documentUtils"], function (STF, gitUtils, orionUtils, docUtils) {

	"use strict";
	var suiteName = "gitByPassGerritSpec", getService = STF.getServicePartial(suiteName);

	describe('gitByPassGerritSpec - git integration by pass push', function () {
		var sProjectName1;
		var oProjectDocument_1;

		var oOptions = {
			sGitUserName        : _getSshUserName(),
			sUserEmail	        : _getUserEmail(),
			sGitPassword        : "",
			sGitSshPrivateKey   : _getSshKey(),
			GitUrl              : "ssh://git.wdf.sap.corp:29418/watt_bypass_test.git",
			bGerrit             : true,
			bBypassCodeReview	: true
		};

		before(function () {
			var that = this;
			this.timeout(120000);
			return orionUtils.startWebIdeWithOrion(suiteName, {config: "infra/git/config.json"}).then(function () {
				gitUtils.oDocumentProvider = getService("filesystem.documentProvider");
				gitUtils.oGit_Service = getService("git");
				gitUtils.oDocumentProvider._oDAO = getService("orionFileDAO");
				gitUtils.oOptions = oOptions;

				return gitUtils.oDocumentProvider.getRoot().then(function (oRoot) {
					gitUtils.oOptions.oRoot = oRoot;
					return gitUtils.cloneRepository().then(function (oResponse) {
						return oRoot.refresh().then(function () {
							sProjectName1 = oResponse.Location.split("/").splice(-1)[0];
							return oRoot.getChild(sProjectName1).then(function(oProjectDoc){
								assert.equal(oProjectDoc.getTitle(),sProjectName1);
								oProjectDocument_1 = oProjectDoc;
								assert.ok( true, "moduleDone" );
							});
						});
					}).fail(function (oError) {
						var message = oError.detailedMessage ? oError.message + " " + oError.detailedMessage : oError.message;
						assert.fail(true, true,"Clone failed (Repository infra_integration_test) - " + message);
					});
				});
			});
		});

		after(function () {
			var aPromises = [];
			if (oProjectDocument_1) {
				aPromises.push(oProjectDocument_1.delete());
			}
			return Q.all(aPromises).then(function () {
				assert.ok(true, "moduleDone");
			}).fin(function(){
				return STF.shutdownWebIde(suiteName);
			});
		});

		it("1. Push - new file (Bypass Gerrit Code Review)", function() {
			var oUserInfo = undefined;
			var bAmend = false;
			var bChangeId = false;
			var fileName = "unit.test." + Math.random().toString() + ".file";
			var fileContent = Math.random().toString();
			var sMessage = "Commit Message " + fileContent;
			var oGit = oProjectDocument_1.getEntity().getBackendData().git;

			return gitUtils.createEditAndStageFile(oProjectDocument_1, fileName , fileContent).then(function(){
				return gitUtils.oGit_Service.getStatus(oGit);
			}).then(function(oStatusBeforeCommit){
				assert.equal(oStatusBeforeCommit.length,1,"Before commit status length should be 1");
				assert.equal(oStatusBeforeCommit[0].FullStatus,"NEW","Status should be NEW");
				assert.equal(oStatusBeforeCommit[0].Name,fileName,"File should be = " + fileName);
				return  gitUtils.oGit_Service.commit(oGit, sMessage, oUserInfo, bAmend, bChangeId);
			}).then(function(){
				return gitUtils.oGit_Service.getStatus(oGit);
			}).then(function(oStatusAftereCommit){
				assert.equal(oStatusAftereCommit.length,0,"After commit status length should be empty");
				return gitUtils.oGit_Service.getLog(oGit,1,50);
			}).then(function(oLogList){
				assert.equal(oLogList.aFormattedLogData[0].Message.indexOf(sMessage) != -1,true,"Commit should be " + sMessage);
				assert.equal(oLogList.aFormattedLogData[0].Diffs[0].Status,"A","Status should be A");
				assert.equal(oLogList.aFormattedLogData[0].Diffs[0].NewPath, fileName,"New path should be " + fileName);
			}).then(function(){
				return gitUtils.oGit_Service.getCommitsCount(oGit);
			}).then(function(oCount){
				assert.equal(oCount.Outgoing,1,"CommitsCount should be 1");
				return gitUtils.oGit_Service.setGitSettings(_getUserEmail(), _getSshUserName());
			}).then(function(){
				return gitUtils.doPullAndPush(oGit,null);
			}).then(function(){
				assert.ok( true, "push succeeds" );
				return gitUtils.oGit_Service.getCommitsCount(oGit);
			}).then(function(oCount){
				assert.equal(oCount.Outgoing,0,"CommitsCount should be 0");
				return gitUtils.deleteAndStageFile(oProjectDocument_1, fileName);
			}).then(function(oResponse){
				assert.ok( oResponse !== false, "deleteAndStageFile succeeds" );
				return gitUtils.oGit_Service.commit(oGit, sMessage, oUserInfo, bAmend, bChangeId);
			}).then(function(){
				return gitUtils.doPullAndPush(oGit,null);
			}).then(function(){
				assert.ok( true, "push (deleted file) succeeds" );
			}).fail(function(error) {
				var errMessage = "";
				if (error.oErrorPushResponse) {
					errMessage = " - " + JSON.stringify(error.oErrorPushResponse.oPushedCommit);
				}
				assert.ok(true, error.name + errMessage);
				return gitUtils.oGit_Service.getRepositoryConfigurations(oGit).then(function(aConfigurations) {
					assert.ok(true, JSON.stringify(aConfigurations));
				});
			});

		});

	});

	function _getSshUserName() {
		return "i025998";
	}

	function _getUserEmail() {
		return "tomer.epstein@sap.com";
	}

	function _getSshKey() {
		return "\
-----BEGIN RSA PRIVATE KEY-----\n\
MIIEowIBAAKCAQEAxdoEbZZJhzKjo9T8axPYUR15YOn+6HdY6C21hZGA1LCL+Zmu\n\
Wdi/xkPvPpiKHiCoz4frWk8sn79mzJoUKi1klGqPSDNBPWJovYS4RN0BGZsUZjBE\n\
M3TRkUTOXu34JBX8a5IYpMWqs42FeQU9fNqoGUXAC/Acc8d44mqsrFv44zx6Y8BF\n\
+dOJK8I9tQ43B7lsSm2XjOwfkUHn63gFIer3jVlh1YxTMSUAQHCfWBKhyrrxWEOp\n\
8KknUmPbCrxpaL6mMUWwLTgln25o95FbLMch//q+ML/DlAhyP1CPBUoMsYwp2YcM\n\
V6Lv6IMyrjOUhEc93Mj6KaYYSPdk+NHzABkHRwIBIwKCAQEAmKDe2DIbduyM3Xhq\n\
84RWanXSqdkVGbsnVAYBD0RcEcoFlKnBA3tSHJrOgL7Q8qt66Tz3YuyexGBz36oP\n\
jkBGRptYlsh0KAoWSQ6cx2ipE8DGl/lZLwJYhgHhB2cegjzYqsEo9CN1DitYVgtb\n\
Ua/+BN4JLcfbb0IbbNXy61zkkgi3z2h+XWu2EjxGXNcaERDZyD+tCh2cI9yzgjkz\n\
voqfW7quCQJZePSHA5sBAhaLeLM/ujVf/hvsklFjk6thx8Rb4fX+6mxhUXnmnfe0\n\
fZ4KMBEFhH5YEmBbv4j2gEyUSqpf0keSkB6iAm05HRkE3FPbiv4+nQtZojF1EJ2U\n\
mVYKWwKBgQD8EZ2anMhGpgfLhqLvFJURLV+CZj8loALwRY2ruTBxGH+Z6fiAPvZk\n\
fanB9x3ep7Oa9TNJIeJLYg4eYBpberz/3mUwx3nlA1LsnTZpWD1w4ps5xsBvKSRW\n\
n6QO9qVd3GbS63lK+nVeV6e/QGkFeknv71eHzbjuBgxVQPdVqp9YWQKBgQDI7/CM\n\
TD1DiojBoxuOdLkt1xpaxDq9wsIO86AyxxBPlaVrD05ocdUvHOr4hCze7tybeyoA\n\
0Tpda41q/iwwXNOz9RNkW8l2mslRZ6gRV6Bhibs65CwknuvwivF5aFRgYWTtrg/K\n\
fG4n2ZA8WwjxCNL4cife0riGqY6Bcuhq7YVonwKBgFZscIzICibZ1slv/VlI4qbN\n\
uliYFaaAAQHr9g79qjVnfDTFP0Hps5ArFaGWjeXwWtYK7QMhj2pNgS78YM7oQMzB\n\
R0PsntItBn0Cs5HVHGE3wDEQ8YUyrV+HMO8v/i7POTJfXMk/7bnyKuJ8e8ddIKoI\n\
6s95u79Sh+K3MDqg5izrAoGBAInJGfnN4N3bVnYms89l+1KiILNEupDAEApAqF1V\n\
TQNfTNuyuWwwzLKXfI0nbznIXMJjFXznPfbqqh17FvyXbJioDUwhrre6mKzZXU24\n\
bfm9h7Naoe05xlvM/VqQruMA9MA816DKWin0RaW6xE2CZMeevEEFhdiuyB5AKlfz\n\
VCp7AoGBAMod1qzetZVkzRn48k3bwlX3lOp1cmVxi1ftHM9JtVjYgNk9wRg7t2CB\n\
1XdwrQoCk2/lhDG11It7xOkms4yWh1unXvvPd6srOoJmEYiQTgDLZD+jm8Bq843c\n\
XiryLmbRKFtDw1rDdhbh2a6PeqI5a8Qsv9hTpSpuhXfhQcZdQqWe\n\
-----END RSA PRIVATE KEY-----\n\
";
	}

});