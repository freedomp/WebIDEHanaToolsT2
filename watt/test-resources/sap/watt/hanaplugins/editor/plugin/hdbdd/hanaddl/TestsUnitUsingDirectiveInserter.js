// based on commit
//49c9fdd5c9953b189aadaf4a612170daeb91a74a CDS: Simplify parameterized tests
RequirePaths.setRequireJsConfigForHanaDdl(2);

define(
    [
        "commonddl/commonddlNonUi",
        "./AbstractV1HanaDdlParserTests",
        "rndrt/rnd",
        "hanaddl/hanaddlNonUi",
        "hanaddl/hanav1/CdsDdlParserResolver",
        "hanaddl/hanav2/CdsDdlParserResolver",
        "hanaddl/hanav3/CdsDdlParserResolver",
        "hanaddl/hanav4/CdsDdlParserResolver",
        "hanaddl/hanav5/CdsDdlParserResolver"

    ], //dependencies
    function (
        commonddlNonUi,
        AbstractV1HanaDdlParserTests,
        rnd,
        hanaddlNonUi
        ) {
        var AccessPolicyDeclarationImpl = commonddlNonUi.AccessPolicyDeclarationImpl;
        var AspectDeclarationImpl = commonddlNonUi.AspectDeclarationImpl;
        var IAstFactory = commonddlNonUi.IAstFactory;
        var CompilationUnitImpl = commonddlNonUi.CompilationUnitImpl;
        var ContextDeclarationImpl = commonddlNonUi.ContextDeclarationImpl;
        var NamedDeclarationImpl = commonddlNonUi.NamedDeclarationImpl;
        var NamespaceDeclarationImpl = commonddlNonUi.NamespaceDeclarationImpl;
        var RoleDeclarationImpl = commonddlNonUi.RoleDeclarationImpl;
        var TypeDeclarationImpl = commonddlNonUi.TypeDeclarationImpl;
        var Category = rnd.Category;
        var ErrorState = rnd.ErrorState;
        var Token = rnd.Token;
        var UsingDirectiveInserter = hanaddlNonUi.UsingDirectiveInserter;

        function Document(source) {
            this.source = source;
        }
        Document.prototype.get0 = function() {
            return this.source;
        };
        Document.prototype.replace = function (start,length,str) {
            var buff = new rnd.StringBuffer(this.source);
            buff.insert(start,str);
            this.source = buff.toString();
        };
        function TestsUnitUsingDirectiveInserter() {
        }
        TestsUnitUsingDirectiveInserter.prototype = Object.create(AbstractV1HanaDdlParserTests.prototype);
        TestsUnitUsingDirectiveInserter.prototype.createCoCoCu = function(source) {
            var ast = this.getParser().parseAndGetAst3(this.getPadFileResolver(), null, source);
            return ast;
        };
        TestsUnitUsingDirectiveInserter.prototype.createExternalNameDeclForType = function() {
            var td = IAstFactory.eINSTANCE.createTypeDeclaration();
            td.setNameToken(new Token(0,"haha",Category.CAT_IDENTIFIER,0,0,0,true,ErrorState.Erroneous,0));
            var context = IAstFactory.eINSTANCE.createContextDeclaration();
            context.setNameToken(new Token(0,"ctx",Category.CAT_IDENTIFIER,0,0,0,true,ErrorState.Erroneous,0));
            context.getStatements().push(td);
            var nsd = IAstFactory.eINSTANCE.createNamespaceDeclaration();
            nsd.setNameToken(new Token(0,"nsp",Category.CAT_IDENTIFIER,0,0,0,true,ErrorState.Erroneous,0));
            var cu = IAstFactory.eINSTANCE.createCompilationUnit();
            cu.getStatements().push(nsd);
            cu.getStatements().push(context);
            return td;
        };
        TestsUnitUsingDirectiveInserter.prototype.createExternalNameDeclForAspect = function() {
            var asp = IAstFactory.eINSTANCE.createAspectDeclaration();
            asp.setNameToken(new Token(0,"haha",Category.CAT_IDENTIFIER,0,0,0,true,ErrorState.Erroneous,0));
            var acp = IAstFactory.eINSTANCE.createAccessPolicyDeclaration();
            acp.setNameToken(new Token(0,"ctx",Category.CAT_IDENTIFIER,0,0,0,true,ErrorState.Erroneous,0));
            acp.getStatements().push(asp);
            var nsd = IAstFactory.eINSTANCE.createNamespaceDeclaration();
            nsd.setNameToken(new Token(0,"nsp",Category.CAT_IDENTIFIER,0,0,0,true,ErrorState.Erroneous,0));
            var cu = IAstFactory.eINSTANCE.createCompilationUnit();
            cu.getStatements().push(nsd);
            cu.getStatements().push(acp);
            return asp;
        };
        TestsUnitUsingDirectiveInserter.prototype.createExternalNameDeclForAspectInsideRole = function() {
            var asp = IAstFactory.eINSTANCE.createAspectDeclaration();
            asp.setNameToken(new Token(0,"haha",Category.CAT_IDENTIFIER,0,0,0,true,ErrorState.Erroneous,0));
            var role = IAstFactory.eINSTANCE.createRoleDeclaration();
            role.setNameToken(new Token(0,"role",Category.CAT_IDENTIFIER,0,0,0,true,ErrorState.Erroneous,0));
            role.getEntries().push(asp);
            var acp = IAstFactory.eINSTANCE.createAccessPolicyDeclaration();
            acp.setNameToken(new Token(0,"ctx",Category.CAT_IDENTIFIER,0,0,0,true,ErrorState.Erroneous,0));
            acp.getStatements().push(role);
            var nsd = IAstFactory.eINSTANCE.createNamespaceDeclaration();
            nsd.setNameToken(new Token(0,"nsp",Category.CAT_IDENTIFIER,0,0,0,true,ErrorState.Erroneous,0));
            var cu = IAstFactory.eINSTANCE.createCompilationUnit();
            cu.getStatements().push(nsd);
            cu.getStatements().push(acp);
            return asp;
        };
        TestsUnitUsingDirectiveInserter.prototype.insertUsingDirectiveForType = function() {
            var source = "namespace ns1; ";
            var document =  new Document(source);
            new UsingDirectiveInserter().doit(this.createExternalNameDeclForType(),this.createCoCoCu(source),document,null);
            equal("namespace ns1; \r\n" + "using nsp::ctx.haha;",document.get0());
        };
        TestsUnitUsingDirectiveInserter.prototype.insertUsingDirectiveForAspect = function() {
            var source = "namespace ns1; ";
            var document = new Document(source);
            new UsingDirectiveInserter().doit(this.createExternalNameDeclForAspect(),this.createCoCoCu(source),document,null);
            equal("namespace ns1; \r\n" + "using nsp::ctx.haha;",document.get0());
        };
        TestsUnitUsingDirectiveInserter.prototype.insertUsingDirectiveForAspectInRole = function() {
            var source = "namespace ns1; ";
            var document = new Document(source);
            new UsingDirectiveInserter().doit(this.createExternalNameDeclForAspectInsideRole(),this.createCoCoCu(source),document,null);
            equal("namespace ns1; \r\n" + "using nsp::ctx.role.haha;",document.get0());
        };
        TestsUnitUsingDirectiveInserter.prototype.usingDirectiveForTypeAlreadyExisting = function() {
            var source = "namespace ns1;\r\nusing nsp::ctx.haha; ";
            var document = new Document(source);
            new UsingDirectiveInserter().doit(this.createExternalNameDeclForType(),this.createCoCoCu(source),document,null);
            equal("namespace ns1;\r\n" + "using nsp::ctx.haha; ",document.get0());
        };
        TestsUnitUsingDirectiveInserter.prototype.usingDirectiveForTypeAlreadyExistingWithAlias = function() {
            var source = "namespace ns1;\r\nusing nsp::ctx.haha as hugo; ";
            var document = new Document(source);
            new UsingDirectiveInserter().doit(this.createExternalNameDeclForType(),this.createCoCoCu(source),document,null);
            equal("namespace ns1;\r\n" + "using nsp::ctx.haha as hugo; ",document.get0());
        };


//TEST METHODS

        test("insertUsingDirectiveForType",function(assert) {
        	var versions = AbstractV1HanaDdlParserTests.parserVersions();
        	for (var i=0;i<versions.length;i++) {
        		var cut=new TestsUnitUsingDirectiveInserter();
        		cut.version = versions[i][0].toString();
        		cut.insertUsingDirectiveForType();
        	}});

        test("insertUsingDirectiveForAspect",function(assert) {
        	var versions = AbstractV1HanaDdlParserTests.parserVersions();
        	for (var i=0;i<versions.length;i++) {
        		var cut=new TestsUnitUsingDirectiveInserter();
        		cut.version = versions[i][0].toString();
        		cut.insertUsingDirectiveForAspect();
        	}});

        test("insertUsingDirectiveForAspectInRole",function(assert) {
        	var versions = AbstractV1HanaDdlParserTests.parserVersions();
        	for (var i=0;i<versions.length;i++) {
        		var cut=new TestsUnitUsingDirectiveInserter();
        		cut.version = versions[i][0].toString();
        		cut.insertUsingDirectiveForAspectInRole();
        	}});

        test("usingDirectiveForTypeAlreadyExisting",function(assert) {
        	var versions = AbstractV1HanaDdlParserTests.parserVersions();
        	for (var i=0;i<versions.length;i++) {
        		var cut=new TestsUnitUsingDirectiveInserter();
        		cut.version = versions[i][0].toString();
        		cut.usingDirectiveForTypeAlreadyExisting();
        	}});

        test("usingDirectiveForTypeAlreadyExistingWithAlias",function(assert) {
        	var versions = AbstractV1HanaDdlParserTests.parserVersions();
        	for (var i=0;i<versions.length;i++) {
        		var cut=new TestsUnitUsingDirectiveInserter();
        		cut.version = versions[i][0].toString();
        		cut.usingDirectiveForTypeAlreadyExistingWithAlias();
        	}});

        QUnit.start();
    }
);