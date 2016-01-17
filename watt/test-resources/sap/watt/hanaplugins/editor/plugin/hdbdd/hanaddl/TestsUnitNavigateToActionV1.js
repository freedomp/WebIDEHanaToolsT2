// based on commit
//49c9fdd5c9953b189aadaf4a612170daeb91a74a CDS: Simplify parameterized tests

RequirePaths.setRequireJsConfigForHanaDdl(2);

define(
    [ "commonddl/commonddlNonUi",
        "TestUtilEclipseSelectionHandling",
        "rndrt/rnd",
        "./AbstractV1HanaDdlParserTests",
        "NavigationTestUtil"
    ], // dependencies
    function(commonddlNonUi, TestUtilEclipseSelectionHandling, rnd, AbstractV1HanaDdlParserTests,NavigationTestUtil) {

        "use strict";

        var AbstractAnnotationImpl = commonddlNonUi.AbstractAnnotationImpl;
        var CompilationUnitImpl = commonddlNonUi.CompilationUnitImpl;
        var ConstDeclarationImpl = commonddlNonUi.ConstDeclarationImpl;
        var ContextDeclarationImpl = commonddlNonUi.ContextDeclarationImpl;
        var DdlStatementImpl = commonddlNonUi.DdlStatementImpl;
        var ElementDeclarationImpl = commonddlNonUi.ElementDeclarationImpl;
        var EntityDeclarationImpl = commonddlNonUi.EntityDeclarationImpl;
        var EnumerationDeclarationImpl = commonddlNonUi.EnumerationDeclarationImpl;
        var EnumerationValueImpl = commonddlNonUi.EnumerationValueImpl;
        var LiteralExpressionImpl = commonddlNonUi.LiteralExpressionImpl;
        var Token = rnd.Token;
        var Utils = rnd.Utils;
        var ErrorState = rnd.ErrorState;

        function TestsUnitNavigateToActionV1(testName, version) {
        }

        TestsUnitNavigateToActionV1.prototype = Object.create(AbstractV1HanaDdlParserTests.prototype);
        TestsUnitNavigateToActionV1.prototype.navigateToConstWithErrorRecovery = function () {
            return NavigationTestUtil.navigate("namespace fu1__2;" + "" + "context dummy1 {" + "" + "" + "                const foreignConstFrom25: Integer = 3; " + "                " + "" + "                type myType {" + "                                                                                             field1 : String(1);                                                                                            " + "                                                                                             field2 : String(1);              " + "                                                                                             " + "                                                   }; " + "" + "                type Taxrate { minRate : Decimal(3,2); maxRate : Decimal(3,2); };" + "                " + "                type Payslip {" + "                               amount : Decimal(10,2);" + "                               taxrate1 : Taxrate;" + "                               grossAmount : type of amount;" + "                               kind : String(7); " + "                               payoutDate : String(8);" + "                };" + "                " + "                context b {" + "                               type anotherType : String(101);" + "                               " + "                               " + "                };" + "                " + "                context c { define entity Entity0 { key field1 : String (19) ;};};  " + "" + "                define entity Entity1 {" + "                key        key1   : String(20); " + "                                                               field1 : String(20); " + "                                                               field2 : Integer;" + "                                                               field4 : Decimal(10,2);" + "                                                               " + "                element     field5 : b.anotherType;" + "                                                               field6 : type of Payslip.taxrate1;" + "                                                               field7 : Payslip;" + "                };" + "" + "                define entity Entity2 {" + "                               key        key1   : String(20); " + "                                                                               field1 : String(20);" + "                                                                              field2 : Integer;" + "                                                                              field4 : Decimal(10,2);" + "                               element     field5 : b.anotherType;" + "                                                                              assoc  : association [0..1] to Entity1 { key1,                            field1, field2 };" + "                                                                              assoc2 : association [0..1] to Entity1 { key1 as keyOne, field1, field2 };" + "                                                                              " + "                };" + "" + "                define entity Entity33 {" + "                               key        key1   : String(10); " + "                                                                               field1 : String(20); " + "                                                                              field2 : Integer;" + "                                                                              field3 : Integer;" + "                                                                              field4 : Decimal(10,2);" + "                               element     field5 : type of myType.field1;" + "                                                                              field6 : type of c.Entity0.field1;" + "                                                                              associations  : ASSOCIATION[0..1] to Entity1;" + "                                                                              assoc2 : association[0..1] to Entity1;" + "                };" + "" + "                entity Address {" + "                               key streetAddress : String(77);" + "                               key zipCode : String(11);" + "                               city : String(44);" + "                };" + "                " + "                entity #selection.begin.one#Employee#selection.end.one# {" + "                               key ID : String(10);" + "                               name : String(77);" + "                               salary : Decimal(10,2);" + "                               payslip1 : Payslip;" + "                               homeAddress : String(7);" + "                               employee: String(9);  " + "                               businessAddress: association[0..1] to Address;  " + "                               furtherAddresses: association [0..1] to Address;  " + "                               " + "" + "                };" + "                " + "                entity Entity5 {" + "                               key field1 : String(10);" + "                                               field3 : type of Employee.payslip1.taxrate1.minRate;" + "                                               field4 : type of Employee.businessAddress.zipCode;" + "                                               field5 : type of Employee.furtherAddresses.zipCode;                                                  " + "                };" + "                " + "                " + "                view MyView1 as select from Entity5 {field1, field3};" + "                " + "                view MyView2 as select from Entity5 {Entity5.field1, Entity5.field3};" + "                " + "" + "                view MyView4 as select from Em#selection.begin.two##selection.end.two#ployee {Employee.salary, Employee.employee, Employee.businessAddress.streetAddress}; " + "                " + "                " + "                define view MyView6 as select from c.Entity0 {field1};" + "                " + "                view MyView7 as select from Employee { min(Employee.salary) as ali1, count(name) as ali2, count( distinct Employee.businessAddress.streetAddress) as alias1 }  " + "                where (salary >= 1000 and name <= 'KKKKK') or ((salary <= 1000 and name >= 'UUUUU') or (salary > 7000));" + "                " + "                " + "                " + "" + "};", this.getParser(), this.getPadFileResolver());
        };
        TestsUnitNavigateToActionV1.prototype.noNavigationOnEmptyLine = function () {
            return NavigationTestUtil.navigateNoResult("namespace CDS_Editor_2_d001685;" + "using CDS_Editor_2_d001685::pgtestddl41.const1s1;" + "using CDS_Editor_2_d001685::pgtestddl25.foreignConstFrom25;" + "" + "context pgtestddl45 {" + "	type myType {" + "			 			field1 : String(1);						" + "			 			field2 : String(1);	" + "			    }; " + " #selection.begin.two##selection.end.two# " + "	type Taxrate { minRate : Decimal(3,2); maxRate : Decimal(3,2); };" + "};", this.getParser(), this.getPadFileResolver());
        };
        TestsUnitNavigateToActionV1.prototype.navigateToRootContextFromUsing = function () {
            return NavigationTestUtil.navigate("namespace fu1.tm1; " + "using fu1.tm1::Sa#selection.begin.two##selection.end.two#lesOrderC.SalesOrderItem; " + "context #selection.begin.one#SalesOrderC#selection.end.one# { " + " 	entity SalesOrder { " + " 		key id : Integer; " + " 		item : association to SalesOrderItem; " + " 	}; " + " 	entity SalesOrderItem { " + " 		price : Integer; " + " 		product:association to SalesOrderC.Product; " + " 	}; " + " 	entity Product { " + " 		name : String(10); " + " 	}; " + " 	define view v as select from SalesOrder { " + " 		id, item.product.name " + " 		 " + " 	}; " + "};", this.getParser(), this.getPadFileResolver());
        };
        TestsUnitNavigateToActionV1.prototype.navigateFromSelectListEntry = function () {
            var that = this;
            return NavigationTestUtil.navigate("namespace fu1.tm1; " + "context SalesOrderC { " + " 	entity SalesOrder { " + " 		key id : Integer; " + " 		item : association to SalesOrderItem; " + " 	}; " + " 	entity SalesOrderItem { " + " 		price : Integer; " + " 		#selection.begin.one#product#selection.end.one#:association to SalesOrderC.Product; " + " 	}; " + " 	entity Product { " + " 		name : String(10); " + " 	}; " + " 	define view v as select from SalesOrder { " + " 		id, item.pro#selection.begin.two##selection.end.two#duct.name " + " 		 " + " 	}; " + "};", that.getParser(), that.getPadFileResolver()).then(function() {
                return NavigationTestUtil.navigate("namespace fu1.tm1; " + "context SalesOrderC { " + " 	entity SalesOrder { " + " 		key id : Integer; " + " 		#selection.begin.one#item#selection.end.one# : association to SalesOrderItem; " + " 	}; " + " 	entity SalesOrderItem { " + " 		price : Integer; " + " 		product:association to SalesOrderC.Product; " + " 	}; " + " 	entity Product { " + " 		name : String(10); " + " 	}; " + " 	define view v as select from SalesOrder { " + " 		id, it#selection.begin.two##selection.end.two#em.product.name " + " 		 " + " 	}; " + "};", that.getParser(), that.getPadFileResolver())
            }).then(function() {
                return NavigationTestUtil.navigate("namespace fu1.tm1; " + "context SalesOrderC { " + " 	entity SalesOrder { " + " 		key id : Integer; " + " 		item : association to SalesOrderItem; " + " 	}; " + " 	entity SalesOrderItem { " + " 		price : Integer; " + " 		product:association to SalesOrderC.Product; " + " 	}; " + " 	entity Product { " + " 		#selection.begin.one#name#selection.end.one# : String(10); " + " 	}; " + " 	define view v as select from SalesOrder { " + " 		id, item.product.n#selection.begin.two##selection.end.two#ame " + " 		 " + " 	}; " + "};", that.getParser(), that.getPadFileResolver())
            }).then(function() {
                return NavigationTestUtil.navigate("namespace fu1.tm1; " + "context SalesOrderC { " + " 	entity SalesOrder { " + " 		key #selection.begin.one#id#selection.end.one# : Integer; " + " 		item : association to SalesOrderItem; " + " 	}; " + " 	entity SalesOrderItem { " + " 		price : Integer; " + " 		product:association to SalesOrderC.Product; " + " 	}; " + " 	entity Product { " + " 		name : String(10); " + " 	}; " + " 	define view v as select from SalesOrder { " + " 		i#selection.begin.two##selection.end.two#d, item.product.name " + " 		 " + " 	}; " + "};", that.getParser(), that.getPadFileResolver())
            });
        };
        TestsUnitNavigateToActionV1.prototype.navigateToType = function () {
            var that = this;
            return NavigationTestUtil.navigate("namespace fu1.tm1; " + "context navigation_types { " + " 	type #selection.begin.one#simple1#selection.end.one# : Integer; " + " 	type simple2 : simple1; " + " 	type simple3 : simple2; " + " 	type struc { " + " 		simple1a : si#selection.begin.two##selection.end.two#mple1; " + " 		simple2b : simple2; " + " 		simple3a : simple3;  " + " 	}; " + " 	type struc2 { " + " 		struc1 : struc; " + " 		struc2 : type of struc.simple1a; " + " 		struc2a : type of navigation_types.struc.simple3c; " + " 		struc3aa : simple2; " + " 		struc3ab : simple3; " + " 		struc3 : navigation_types.simple2; " + " 		struc4 : navigation_types.simple3; " + " 	}; " + "};", that.getParser(), that.getPadFileResolver()).then(function() {
                return NavigationTestUtil.navigate("namespace fu1.tm1; " + "context navigation_types { " + " 	type simple1 : Integer; " + " 	type #selection.begin.one#simple2#selection.end.one# : simple1; " + " 	type simple3 : simple2; " + " 	type struc { " + " 		simple1a : simple1; " + " 		simple2b : #selection.begin.two##selection.end.two#simple2; " + " 		simple3a : simple3;  " + " 	}; " + " 	type struc2 { " + " 		struc1 : struc; " + " 		struc2 : type of struc.simple1a; " + " 		struc2a : type of navigation_types.struc.simple3c; " + " 		struc3aa : simple2; " + " 		struc3ab : simple3; " + " 		struc3 : navigation_types.simple2; " + " 		struc4 : navigation_types.simple3; " + " 	}; " + "};", that.getParser(), that.getPadFileResolver());
            }).then(function() {
                return NavigationTestUtil.navigate("namespace fu1.tm1; " + "context navigation_types { " + " 	type simple1 : Integer; " + " 	type simple2 : simple1; " + " 	type #selection.begin.one#simple3#selection.end.one# : simple2; " + " 	type struc { " + " 		simple1a : simple1; " + " 		simple2b : simple2; " + " 		simple3a : si#selection.begin.two##selection.end.two#mple3;  " + " 	}; " + " 	type struc2 { " + " 		struc1 : struc; " + " 		struc2 : type of struc.simple1a; " + " 		struc2a : type of navigation_types.struc.simple3c; " + " 		struc3aa : simple2; " + " 		struc3ab : simple3; " + " 		struc3 : navigation_types.simple2; " + " 		struc4 : navigation_types.simple3; " + " 	}; " + "};", that.getParser(), that.getPadFileResolver());
            }).then(function() {
                return NavigationTestUtil.navigate("namespace fu1.tm1; " + "context navigation_types { " + " 	type simple1 : Integer; " + " 	type simple2 : simple1; " + " 	type simple3 : simple2; " + " 	type #selection.begin.one#struc#selection.end.one# { " + " 		simple1a : simple1; " + " 		simple2b : simple2; " + " 		simple3a : simple3;  " + " 	}; " + " 	type struc2 { " + " 		struc1 : st#selection.begin.two##selection.end.two#ruc; " + " 		struc2 : type of struc.simple1a; " + " 		struc2a : type of navigation_types.struc.simple3c; " + " 		struc3aa : simple2; " + " 		struc3ab : simple3; " + " 		struc3 : navigation_types.simple2; " + " 		struc4 : navigation_types.simple3; " + " 	}; " + "};", that.getParser(), that.getPadFileResolver());
            }).then(function() {
                return NavigationTestUtil.navigate("namespace fu1.tm1; " + "context navigation_types { " + " 	type simple1 : Integer; " + " 	type simple2 : simple1; " + " 	type simple3 : simple2; " + " 	type #selection.begin.one#struc#selection.end.one# { " + " 		simple1a : simple1; " + " 		simple2b : simple2; " + " 		simple3a : simple3;  " + " 	}; " + " 	type struc2 { " + " 		struc1 : struc; " + " 		struc2 : type of str#selection.begin.two##selection.end.two#uc.simple1a; " + " 		struc2a : type of navigation_types.struc.simple3c; " + " 		struc3aa : simple2; " + " 		struc3ab : simple3; " + " 		struc3 : navigation_types.simple2; " + " 		struc4 : navigation_types.simple3; " + " 	}; " + "};", that.getParser(), that.getPadFileResolver());
            }).then(function() {
                return NavigationTestUtil.navigate("namespace fu1.tm1; " + "context navigation_types { " + " 	type simple1 : Integer; " + " 	type simple2 : simple1; " + " 	type simple3 : simple2; " + " 	type struc { " + " 		#selection.begin.one#simple1a#selection.end.one# : simple1; " + " 		simple2b : simple2; " + " 		simple3a : simple3;  " + " 	}; " + " 	type struc2 { " + " 		struc1 : struc; " + " 		struc2 : type of struc.#selection.begin.two##selection.end.two#simple1a; " + " 		struc2a : type of navigation_types.struc.simple3c; " + " 		struc3aa : simple2; " + " 		struc3ab : simple3; " + " 		struc3 : navigation_types.simple2; " + " 		struc4 : navigation_types.simple3; " + " 	}; " + "};", that.getParser(), that.getPadFileResolver());
            }).then(function() {
                return NavigationTestUtil.navigate("namespace fu1.tm1; " + "context #selection.begin.one#navigation_types#selection.end.one# { " + " 	type simple1 : Integer; " + " 	type simple2 : simple1; " + " 	type simple3 : simple2; " + " 	type struc { " + " 		simple1a : simple1; " + " 		simple2b : simple2; " + " 		simple3a : simple3;  " + " 	}; " + " 	type struc2 { " + " 		struc1 : struc; " + " 		struc2 : type of struc.simple1a; " + " 		struc2a : type of naviga#selection.begin.two##selection.end.two#tion_types.struc.simple3c; " + " 		struc3aa : simple2; " + " 		struc3ab : simple3; " + " 		struc3 : navigation_types.simple2; " + " 		struc4 : navigation_types.simple3; " + " 	}; " + "};", that.getParser(), that.getPadFileResolver());
            }).then(function() {
                return NavigationTestUtil.navigate("namespace fu1.tm1; " + "context navigation_types { " + " 	type simple1 : Integer; " + " 	type simple2 : simple1; " + " 	type simple3 : simple2; " + " 	type struc { " + " 		simple1a : simple1; " + " 		simple2b : simple2; " + " 		#selection.begin.one#simple3c#selection.end.one# : simple3;  " + " 	}; " + " 	type struc2 { " + " 		struc1 : struc; " + " 		struc2 : type of struc.simple1a; " + " 		struc2a : type of navigation_types.struc.#selection.begin.two##selection.end.two#simple3c; " + " 		struc3aa : simple2; " + " 		struc3ab : simple3; " + " 		struc3 : navigation_types.simple2; " + " 		struc4 : navigation_types.simple3; " + " 	}; " + "};", that.getParser(), that.getPadFileResolver());
            }).then(function() {
                return NavigationTestUtil.navigate("namespace fu1.tm1; " + "context navigation_types { " + " 	type #selection.begin.one#simple1#selection.end.one# : Integer; " + " 	type simple2 : simple1; " + " 	type simple3 : simple2; " + " 	type struc { " + " 		simple1a : simple1; " + " 		simple2b : simple2; " + " 		simple3 : simp#selection.begin.two##selection.end.two#le3;  " + " 	}; " + " 	type struc2 { " + " 		struc1 : struc; " + " 		struc2 : type of struc.simple1a; " + " 		struc2a : type of navigation_types.struc.simple3c; " + " 		struc3aa : simple2; " + " 		struc3ab : simple3; " + " 		struc3 : navigation_types.simple2; " + " 		struc4 : navigation_types.simple3; " + " 	}; " + "};", that.getParser(), that.getPadFileResolver());
            }).then(function() {
                return NavigationTestUtil.navigate("namespace fu1.tm1; " + "context navigation_types { " + " 	type simple1 : Integer; " + " 	type #selection.begin.one#simple2#selection.end.one# : simple1; " + " 	type simple3 : simple2; " + " 	type struc { " + " 		simple1a : simple1; " + " 		simple2b : simple2; " + " 		simple3 : simple3;  " + " 	}; " + " 	type struc2 { " + " 		struc1 : struc; " + " 		struc2 : type of struc.simple1a; " + " 		struc2a : type of navigation_types.struc.simple3c; " + " 		struc3aa : sim#selection.begin.two##selection.end.two#ple2; " + " 		struc3ab : simple3; " + " 		struc3 : navigation_types.simple2; " + " 		struc4 : navigation_types.simple3; " + " 	}; " + "};", that.getParser(), that.getPadFileResolver());
            }).then(function() {
                return NavigationTestUtil.navigate("namespace fu1.tm1; " + "context navigation_types { " + " 	type simple1 : Integer; " + " 	type simple2 : simple1; " + " 	type #selection.begin.one#simple3#selection.end.one# : simple2; " + " 	type struc { " + " 		simple1a : simple1; " + " 		simple2b : simple2; " + " 		simple3 : simple3;  " + " 	}; " + " 	type struc2 { " + " 		struc1 : struc; " + " 		struc2 : type of struc.simple1a; " + " 		struc2a : type of navigation_types.struc.simple3c; " + " 		struc3aa : simple2; " + " 		struc3ab : simple3; " + " 		struc3 : navigation_types.simple2; " + " 		struc4 : navigation_types.si#selection.begin.two##selection.end.two#mple3; " + " 	}; " + "};", that.getParser(), that.getPadFileResolver());
            });
        };

        TestsUnitNavigateToActionV1.prototype.navigateToGeneratedTable = function () {
            expect(0);// navigation to generation artifact not yet supported in WebIDE
            return Q.resolve();
            /*
             if (Platform.isRunning() == false && EditorsPlugin.getDefault() == null) {
             new EditorsPlugin().setMarkerAnnotationPreferences(new MarkerAnnotationPreferences());
             }
             var targetSchema=[""];
             var targetFqn=[""];
             var cut=new NavigateToAction(NavigationTestUtil.createResourceBundle(),"",null){
             @Override protected void navigateToCatalogTable(  IProject project,  String fqn,  String schema){
             targetFqn[0]=fqn;
             targetSchema[0]=schema;
             }
             }
             ;
             var sourceWithSelections="namespace fu1.tm1; " + "context navigation_types { "+ " entity e#selection.begin.one#n#selection.end.one#t { id : Integer; };"+ "};";
             var source=[""];
             var selections={};
             TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
             var sel=Object.values(selections);
             cut.navigate(this.getParser(),this.getPadFileResolver(),NavigationTestUtil.createTextEditor(source[0]),sel[0].getOffset());
             equal("SYSTEM",targetSchema[0]);
             equal("fu1.tm1::navigation_types.ent",targetFqn[0]);
             */
        };


        TestsUnitNavigateToActionV1.prototype.navigateToGeneratedTableWithQuotesInNamespace = function () {
            expect(0);// navigation to generation artifact not yet supported in WebIDE
            return Q.resolve();
            /*
             if (Platform.isRunning() == false && EditorsPlugin.getDefault() == null) {
             new EditorsPlugin().setMarkerAnnotationPreferences(new MarkerAnnotationPreferences());
             }
             var targetSchema=[""];
             var targetFqn=[""];
             var cut=new NavigateToAction(NavigationTestUtil.createResourceBundle(),"",null){
             @Override protected void navigateToCatalogTable(  IProject project,  String fqn,  String schema){
             targetFqn[0]=fqn;
             targetSchema[0]=schema;
             }
             }
             ;
             var sourceWithSelections="namespace \"fu-1\".\"tm1\"; " + "context navigation_types { "+ " entity e#selection.begin.one#n#selection.end.one#t { id : Integer; };"+ "};";
             var source=[""];
             var selections={};
             TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
             var sel=Object.values(selections);
             cut.navigate(this.getParser(),this.getPadFileResolver(),NavigationTestUtil.createTextEditor(source[0]),sel[0].getOffset());
             equal("SYSTEM",targetSchema[0]);
             equal("fu-1.tm1::navigation_types.ent",targetFqn[0]);
             */
        };


        TestsUnitNavigateToActionV1.prototype.navigateToGeneratedTableIfElementHasSameName = function () {
            expect(0);// navigation to generation artifact not yet supported in WebIDE
            return Q.resolve();
            /*
             if (Platform.isRunning() == false && EditorsPlugin.getDefault() == null) {
             new EditorsPlugin().setMarkerAnnotationPreferences(new MarkerAnnotationPreferences());
             }
             var targetSchema=[""];
             var targetFqn=[""];
             var cut=new NavigateToAction(NavigationTestUtil.createResourceBundle(),"",null){
             @Override protected void navigateToCatalogTable(  IProject project,  String fqn,  String schema){
             targetFqn[0]=fqn;
             targetSchema[0]=schema;
             }
             }
             ;
             var sourceWithSelections="namespace fu1.tm1; " + "context navigation_types { "+ " entity e#selection.begin.one#n#selection.end.one#t { id : Integer; ent : Integer; };"+ "};";
             var source=[""];
             var selections={};
             TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
             var sel=Object.values(selections);
             cut.navigate(this.getParser(),this.getPadFileResolver(),NavigationTestUtil.createTextEditor(source[0]),sel[0].getOffset());
             equal("SYSTEM",targetSchema[0]);
             equal("fu1.tm1::navigation_types.ent",targetFqn[0]);
             */
        };


        TestsUnitNavigateToActionV1.prototype.navigateToGeneratedView = function () {
            expect(0);// navigation to generation artifact not yet supported in WebIDE
            return Q.resolve();
            /*
             if (Platform.isRunning() == false && EditorsPlugin.getDefault() == null) {
             new EditorsPlugin().setMarkerAnnotationPreferences(new MarkerAnnotationPreferences());
             }
             var targetSchema=[""];
             var targetFqn=[""];
             var cut=new NavigateToAction(NavigationTestUtil.createResourceBundle(),"",null){
             @Override protected void navigatetoCatalogView(  IProject project,  String fqn,  String schema){
             targetFqn[0]=fqn;
             targetSchema[0]=schema;
             }
             }
             ;
             var sourceWithSelections="namespace fu1.tm1; " + "context navigation_types { "+ " view e#selection.begin.one#n#selection.end.one#t as select from entity { id };"+ "};";
             var source=[""];
             var selections={};
             TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
             var sel=Object.values(selections);
             cut.navigate(this.getParser(),this.getPadFileResolver(),NavigationTestUtil.createTextEditor(source[0]),sel[0].getOffset());
             equal("SYSTEM",targetSchema[0]);
             equal("fu1.tm1::navigation_types.ent",targetFqn[0]);
             */
        };


        TestsUnitNavigateToActionV1.prototype.navigateToGeneratedViewWithQuotesInNamespace = function () {
            expect(0);// navigation to generation artifact not yet supported in WebIDE
            return Q.resolve();
            /*
             if (Platform.isRunning() == false && EditorsPlugin.getDefault() == null) {
             new EditorsPlugin().setMarkerAnnotationPreferences(new MarkerAnnotationPreferences());
             }
             var targetSchema=[""];
             var targetFqn=[""];
             var cut=new NavigateToAction(NavigationTestUtil.createResourceBundle(),"",null){
             @Override protected void navigatetoCatalogView(  IProject project,  String fqn,  String schema){
             targetFqn[0]=fqn;
             targetSchema[0]=schema;
             }
             }
             ;
             var sourceWithSelections="namespace \"fu-1\".tm1; " + "context navigation_types { "+ " view e#selection.begin.one#n#selection.end.one#t as select from entity { id };"+ "};";
             var source=[""];
             var selections={};
             TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
             var sel=Object.values(selections);
             cut.navigate(this.getParser(),this.getPadFileResolver(),NavigationTestUtil.createTextEditor(source[0]),sel[0].getOffset());
             equal("SYSTEM",targetSchema[0]);
             equal("fu-1.tm1::navigation_types.ent",targetFqn[0]);
             */
        };


        TestsUnitNavigateToActionV1.prototype.navigateToGeneratedViewIfElementHasSameName = function () {
            expect(0);// navigation to generation artifact not yet supported in WebIDE
            return Q.resolve();
            /*
             if (Platform.isRunning() == false && EditorsPlugin.getDefault() == null) {
             new EditorsPlugin().setMarkerAnnotationPreferences(new MarkerAnnotationPreferences());
             }
             var targetSchema=[""];
             var targetFqn=[""];
             var cut=new NavigateToAction(NavigationTestUtil.createResourceBundle(),"",null){
             @Override protected void navigatetoCatalogView(  IProject project,  String fqn,  String schema){
             targetFqn[0]=fqn;
             targetSchema[0]=schema;
             }
             }
             ;
             var sourceWithSelections="namespace fu1.tm1; " + "context navigation_types { "+ "entity employee { "+ " id : String(5);"+ " myview : String(5);"+ "};"+ " view my#selection.begin.one#v#selection.end.one#iew as select from employee { id, myview };"+ "};";
             var source=[""];
             var selections={};
             TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
             var sel=Object.values(selections);
             cut.navigate(this.getParser(),this.getPadFileResolver(),NavigationTestUtil.createTextEditor(source[0]),sel[0].getOffset());
             equal("SYSTEM",targetSchema[0]);
             equal("fu1.tm1::navigation_types.myview",targetFqn[0]);
             */
        };

        TestsUnitNavigateToActionV1.prototype.navigateEntityAttribtueSameName = function () {
            var that = this;
            return NavigationTestUtil.navigate("namespace fu1__2; " + "context testWithSteffen { " + "entity #selection.begin.one#Employee#selection.end.one# { " + "key id : Integer; " + "Employee : Integer; " + "Employee1 : association to testWithSteffen.Employee; " + "}; " + " " + "define view v as select from Employee { Empl#selection.begin.two##selection.end.two#oyee.Employee1.Employee }; " + "};", that.getParser(), that.getPadFileResolver()).then(function() {
                return NavigationTestUtil.navigate("namespace fu1__2; " + "context testWithSteffen { " + "entity Employee { " + "key id : Integer; " + "Employee : Integer; " + "#selection.begin.one#Employee1#selection.end.one# : association to testWithSteffen.Employee; " + "}; " + " " + "define view v as select from Employee { Employee.Em#selection.begin.two##selection.end.two#ployee1.Employee }; " + "};", that.getParser(), that.getPadFileResolver());
            }).then(function() {
                return NavigationTestUtil.navigate("namespace fu1__2; " + "context testWithSteffen { " + "entity #selection.begin.one#Employee#selection.end.one# { " + "key id : Integer; " + "Employee : Integer; " + "Employee1 : association to testWithSteffen.Employee; " + "}; " + " " + "define view v as select from Empl#selection.begin.two##selection.end.two#oyee { Employee.Employee1.Employee }; " + "};", that.getParser(), that.getPadFileResolver());
            });
        };
        TestsUnitNavigateToActionV1.prototype.viewOnView = function () {
            var that = this;
            return NavigationTestUtil.navigate("				namespace fu1__2; " + "context testWithSteffen { " + " " + "define view v100 as select from extEnt  as ali  {  ali.k as #selection.begin.one#fxm1#selection.end.one#,fx2 } order by field1  ; " + " " + "define view v1 as select from v100 as alias { alias.fx2, v100.fx2, fx2, fx#selection.begin.two##selection.end.two#m1 }; " + " " + "};", that.getParser(), that.getPadFileResolver()).then(function() {
                return NavigationTestUtil.navigate("				namespace fu1__2; " + "context testWithSteffen { " + " " + "define view v100 as select from extEnt  as ali  {  ali.k as fxm1,#selection.begin.one#fx2#selection.end.one# } order by field1  ; " + " " + "define view v1 as select from v100 as alias { alias.fx2, v100.fx2, f#selection.begin.two##selection.end.two#x2, fxm1 }; " + " " + "};", that.getParser(), that.getPadFileResolver());
            }).then(function() {
                return NavigationTestUtil.navigate("				namespace fu1__2; " + "context testWithSteffen { " + " " + "define view v100 as select from extEnt  as ali  {  ali.k as fxm1,#selection.begin.one#fx2#selection.end.one# } order by field1  ; " + " " + "define view v1 as select from v100 as alias { alias.fx2, v100.f#selection.begin.two##selection.end.two#x2, fx2, fxm1 }; " + " " + "};", that.getParser(), that.getPadFileResolver());
            }).then(function() {
                return NavigationTestUtil.navigate("				namespace fu1__2; " + "context testWithSteffen { " + " " + "define view v100 as select from extEnt  as ali  {  ali.k as fxm1,#selection.begin.one#fx2#selection.end.one# } order by field1  ; " + " " + "define view v1 as select from v100 as alias { alias.f#selection.begin.two##selection.end.two#x2, v100.fx2, fx2, fxm1 }; " + " " + "};", that.getParser(), that.getPadFileResolver());
            }).then(function() {
                return NavigationTestUtil.navigate("				namespace fu1__2; " + "context testWithSteffen { " + " " + "define view #selection.begin.one#v100#selection.end.one# as select from extEnt  as ali  {  ali.k as fxm1,fx2 } order by field1  ; " + " " + "define view v1 as select from v100 as alias { al#selection.begin.two##selection.end.two#ias.fx2, v100.fx2, fx2, fxm1 }; " + " " + "};", that.getParser(), that.getPadFileResolver());
            }).then(function() {
                return NavigationTestUtil.navigate("				namespace fu1__2; " + "context testWithSteffen { " + " " + "define view #selection.begin.one#v100#selection.end.one# as select from extEnt  as ali  {  ali.k as fxm1,fx2 } order by field1  ; " + " " + "define view v1 as select from v100 as alias { alias.fx2, v1#selection.begin.two##selection.end.two#00.fx2, fx2, fxm1 }; " + " " + "};", that.getParser(), that.getPadFileResolver());
            });
        };
        TestsUnitNavigateToActionV1.prototype.navigateToForeignKeyOfAssociationDeclaration = function () {
            var that = this;
            return NavigationTestUtil.navigate("namespace fu1__2; " + "context testWithSteffen { " + "type mytype :    type of myStruc.struc2 ; " + "type myStruc2 { " + "struc2_1 : Integer; " + "field2 : String(10); " + "}; " + "entity entity0 { " + "field0 : Integer; " + "field0a : String(10); " + "struc0a : myStruc2; " + "asso0a : association to entity2; " + "}; " + "entity entity1 { " + "#selection.begin.one#field1#selection.end.one# : Integer; " + "field2 : String(10); " + "struc2 : myStruc2; " + "asso2 : association to entity2; " + "}; " + "entity entity2 { " + "asso1 : association to entity1 { fie#selection.begin.two##selection.end.two#ld1,struc2.field2  }; " + "asso1 : association to entity0 { <> }; " + "}; " + "define view v as select from myStruc { struc2  } ; " + "};", that.getParser(), that.getPadFileResolver()).then(function() {
                return NavigationTestUtil.navigate("namespace fu1__2; " + "context testWithSteffen { " + "type mytype :    type of myStruc.struc2 ; " + "type myStruc2 { " + "struc2_1 : Integer; " + "field2 : String(10); " + "}; " + "entity entity0 { " + "field0 : Integer; " + "field0a : String(10); " + "struc0a : myStruc2; " + "asso0a : association to entity2; " + "}; " + "entity entity1 { " + "field1 : Integer; " + "field2 : String(10); " + "#selection.begin.one#struc2#selection.end.one# : myStruc2; " + "asso2 : association to entity2; " + "}; " + "entity entity2 { " + "asso1 : association to entity1 { field1,str#selection.begin.two##selection.end.two#uc2.field2  }; " + "asso1 : association to entity0 { <> }; " + "}; " + "define view v as select from myStruc { struc2  } ; " + "};", that.getParser(), that.getPadFileResolver());
            }).then(function() {
                return NavigationTestUtil.navigate("namespace fu1__2; " + "context testWithSteffen { " + "type mytype :    type of myStruc.struc2 ; " + "type myStruc2 { " + "struc2_1 : Integer; " + "#selection.begin.one#field2#selection.end.one# : String(10); " + "}; " + "entity entity0 { " + "field0 : Integer; " + "field0a : String(10); " + "struc0a : myStruc2; " + "asso0a : association to entity2; " + "}; " + "entity entity1 { " + "field1 : Integer; " + "field2 : String(10); " + "struc2 : myStruc2; " + "asso2 : association to entity2; " + "}; " + "entity entity2 { " + "asso1 : association to entity1 { field1,struc2.fie#selection.begin.two##selection.end.two#ld2  }; " + "asso1 : association to entity0 { <> }; " + "}; " + "define view v as select from myStruc { struc2  } ; " + "};", that.getParser(), that.getPadFileResolver());
            }).then(function() {
                return NavigationTestUtil.navigateNoResult("namespace fu1__2; " + "context testWithSteffen { " + "type mytype :    type of myStruc.struc2 ; " + "type myStruc2 { " + "struc2_1 : Integer; " + "field2 : String(10); " + "}; " + "entity entity0 { " + "field0 : Integer; " + "field0a : String(10); " + "struc0a : myStruc2; " + "asso0a : association to entity2; " + "}; " + "entity entity1 { " + "field1 : Integer; " + "field2 : String(10); " + "struc2 : myStruc2; " + "asso2 : association to entity2; " + "}; " + "entity entity2 { " + "asso1 : association to entity1 { field1,struc2.field2  }; " + "asso1 : association to entity0 { <> }; " + "}; " + "define view v as select from mySt#selection.begin.two##selection.end.two#ruc { struc2  } ; " + "};", that.getParser(), that.getPadFileResolver());
            });
        };
        TestsUnitNavigateToActionV1.prototype.invalidPath = function () {
            return NavigationTestUtil.navigateNoResult(" namespace fu1__2;" + "context test7 {" + " 	context nested {" + " 		context nested2 {" + " 			context nested3 {" + " 				type mytype : Integer;" + " 				type ref : test7.nested.nested2.nested3_.myt#selection.begin.two##selection.end.two#ype;" + " 			};" + " 		};" + " 	};" + " 	" + "};", this.getParser(), this.getPadFileResolver());
        };
        TestsUnitNavigateToActionV1.prototype.navigateToEntityElementTypeOf = function () {
            return NavigationTestUtil.navigate(" namespace fu1__2;" + "context test7 {" + "	entity en1 { " + "       #selection.begin.one#element1#selection.end.one# : Integer; " + "       element2 : type of ele#selection.begin.two##selection.end.two#ment1;" + "};", this.getParser(), this.getPadFileResolver());
        };
        TestsUnitNavigateToActionV1.prototype.navigateToStructureElementTypeOf = function () {
            return NavigationTestUtil.navigate(" namespace fu1__2;" + "context test7 {" + "	type struc { " + "       #selection.begin.one#element1#selection.end.one# : Integer; " + "       element2 : type of ele#selection.begin.two##selection.end.two#ment1;" + "   }; " + "};", this.getParser(), this.getPadFileResolver());
        };
        TestsUnitNavigateToActionV1.prototype.navigateToNestedContext = function () {
            var that = this;
            return NavigationTestUtil.navigate("namespace fu1__2; " + "context testWithSteffen { " + "entity e1 { " + "asso : association to nes#selection.begin.two##selection.end.two#ted1.nested2.enested; " + "}; " + " " + "context #selection.begin.one#nested1#selection.end.one# { " + "context nested2 { " + "entity enested { " + "}; " + "}; " + "}; " + "}; ", that.getParser(), that.getPadFileResolver()).then(function() {
            }).then(function() {
                return NavigationTestUtil.navigate("				namespace fu1__2; " + "context testWithSteffen { " + "entity e1 { " + "asso : association to nested1.nested2.e#selection.begin.two##selection.end.two#v1 ; " + "}; " + "context nested1 { " + "context nested2 { " + "define view #selection.begin.one#ev1#selection.end.one# as select from e1 { field }; " + "}; " + "}; " + "};", that.getParser(), that.getPadFileResolver());
            }).then(function() {
                return NavigationTestUtil.navigate("				namespace fu1__2; " + "context testWithSteffen { " + "entity e1 { " + "asso : association to nested1.nes#selection.begin.two##selection.end.two#ted2.ev1 ; " + "}; " + "context nested1 { " + "context #selection.begin.one#nested2#selection.end.one# { " + "define view ev1 as select from e1 { field }; " + "}; " + "}; " + "};", that.getParser(), that.getPadFileResolver());
            }).then(function() {
                return NavigationTestUtil.navigate("				namespace fu1__2; " + "context testWithSteffen { " + "entity e1 { " + "asso : association to nest#selection.begin.two##selection.end.two#ed1.nested2.ev1 ; " + "}; " + "context #selection.begin.one#nested1#selection.end.one# { " + "context nested2 { " + "define view ev1 as select from e1 { field }; " + "}; " + "}; " + "};", that.getParser(), that.getPadFileResolver());
            });
        };
        TestsUnitNavigateToActionV1.prototype.navigateToEntityNameSameEntityNameInDifferentContexts = function () {
            return NavigationTestUtil.navigate("namespace playground.melcher;          " + "context cctest0003 {                   " + "    entity meins {                     " + "    };                                 " + "    context nested {                   " + "        entity #selection.begin.one#meins#selection.end.one# {                 " + "                CDDD : association to me#selection.begin.two##selection.end.two#ins; " + "                };                     " + "    };                                 " + "}				                        ", this.getParser(), this.getPadFileResolver());
        };
        TestsUnitNavigateToActionV1.prototype.navigateToSimpleTypeNameSameSimpleTypeNameInDifferentContexts = function () {
            return NavigationTestUtil.navigate("namespace playground.melcher;          " + "context cctest0003 {                   " + "    type meins : Integer;              " + "    context nested {                   " + "        type #selection.begin.one#meins#selection.end.one# : Integer;          " + "        entity e {                 " + "                CDDD : m#selection.begin.two##selection.end.two#eins; " + "                };                     " + "    };                                 " + "}				                        ", this.getParser(), this.getPadFileResolver());
        };
        TestsUnitNavigateToActionV1.prototype.navigateToLocalStructuredTypeNameSameStructuredTypeNameInDifferentContexts = function () {
            return NavigationTestUtil.navigate("namespace playground.melcher;          " + "context cctest0003 {                   " + "    type meins { a : Integer; b : Integer; };              " + "    context nested {                   " + "        type #selection.begin.one#meins#selection.end.one# { a : Integer; b : Integer; };         " + "        entity e {                 " + "                CDDD : me#selection.begin.two##selection.end.two#ins; " + "                };                     " + "    };                                 " + "}				                        ", this.getParser(), this.getPadFileResolver());
        };
        TestsUnitNavigateToActionV1.prototype.navigateToViewNameSameViewNameInDifferentContexts = function () {
            return NavigationTestUtil.navigate("namespace playground.melcher;          " + "context cctest0003 {                   " + "    view view as select from meins { s};              " + "    context nested1 {" + "       view view as select from meins { s};" + "    };" + "    context nested {                   " + "        view #selection.begin.one#view#selection.end.one# as select from meins { s};         " + "        entity e {                 " + "                CDDD : association to v#selection.begin.two##selection.end.two#iew; " + "                };                     " + "    };                                 " + "}				                        ", this.getParser(), this.getPadFileResolver());
        };
        TestsUnitNavigateToActionV1.prototype.navigateToEntityElementFromAssociationDefinition = function () {
            return NavigationTestUtil.navigate("namespace playground.melcher;          " + "context cctest0003 {                   " + "    entity en1 {                   " + "        key #selection.begin.one#id11111#selection.end.one# : Integer;       " + "        val : association to bbb on id1#selection.begin.two##selection.end.two#1111 = val.id; " + "    };" + "    entity bbb {" + "        key id : Integer;" + "    };" + "}			", this.getParser(), this.getPadFileResolver());
        };


        TestsUnitNavigateToActionV1.prototype.testAllMethodsInSupportedVersions(true);

        QUnit.start();
    }
);