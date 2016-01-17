%{


// ----------------------------------------------- Start utility functions -----------------------------------------------

// define(["./OSDLConstants","rndrt/rnd"],
//		function(SapOSDLConstants,rnd){{

var newLineNoOfChars = this.newLineNoOfChars;


var codeOffset = function(_yy_) {
//	console.log("newLineNoOfChars = ", newLineNoOfChars);
    return _yy_.matched.length - _yy_.match.length;
}

var newToken = function(t_num,t_text,t_category, err) {
	var errState = err ? err : rnd.ErrorState.Correct;
	return new rnd.Token(t_num,t_text,t_category, codeOffset(yy_), yylloc.first_line, yylloc.first_column+1, false, errState, 0);
};

var newIdToken = function(t_text,t_tir) {
	var numId = t_tir.getTokenIndex(t_text);
	if ( numId == -1 ) {
		return new rnd.Token(t_tir.getActualNUMID(),t_text,rnd.Category.CAT_UNDEF, codeOffset(yy_), yylloc.first_line, yylloc.first_column+1, false, rnd.ErrorState.Suspicious, 0);
	} else {
		return new rnd.Token(numId,t_text,rnd.Category.CAT_KEYWORD, codeOffset(yy_), yylloc.first_line, yylloc.first_column+1, false, rnd.ErrorState.Correct, 0);
	};
};

var multiplicityToken = {};
    multiplicityToken['"1"'] = SapOSDLConstants.MULTIPLICITY_ONE;
    multiplicityToken['"*"'] = SapOSDLConstants.MULTIPLICITY_MANY;
    multiplicityToken['"0..1"'] = SapOSDLConstants.MULTIPLICITY_ZERO_OR_ONE;
    multiplicityToken['"1..*"'] = SapOSDLConstants.MULTIPLICITY_ONE_OR_MORE;

var newMultiplicityToken = function(t_text,t_tir) {
	var numId = -1;
	numId = multiplicityToken[t_text];
	if ( numId == -1 ) {
		return new rnd.Token(t_tir.getActualNUMID(),t_text,rnd.Category.CAT_UNDEF, codeOffset(yy_), yylloc.first_line, yylloc.first_column+1, false, rnd.ErrorState.Suspicious, 0);
	} else {
		return new rnd.Token(numId,t_text,rnd.Category.CAT_KEYWORD, codeOffset(yy_), yylloc.first_line, yylloc.first_column+1, false, rnd.ErrorState.Correct, 0);
	};
};

var qstringBuffer = [];
var remarkBuffer = [];
var firstTokenColumn = 0;
var firstTokenLine = 0;

var literal_start = function(quoteSign) {
	this.qstringBuffer = [quoteSign];
	this.firstTokenColumn = yylloc.first_column;
	this.firstTokenLine = yylloc.first_line;
};

var literal_add = function(match) {
	this.qstringBuffer.push(match);
};

var quoted_id_add = function(match) {
	this.qstringBuffer.push(match);
};


var literal_get = function(quoteSign) {
	this.qstringBuffer.push(quoteSign);
    return this.qstringBuffer.join('');
};

var remark_start = function(remark) {
	this.remarkBuffer = [remark];
	this.firstTokenColumn 	= yylloc.first_column;
	this.firstTokenLine = yylloc.first_line;
};

var remark_add = function(match) {
	this.remarkBuffer.push(match);
};

var remark_get = function(remark) {
	this.remarkBuffer.push(remark);
    return this.remarkBuffer.join('');
};

var token_start = function() {
	yylloc.first_column = this.firstTokenColumn;
	yylloc.first_line = this.firstTokenLine;
};

// ---------------------------------------------------- End Utility functions ---------------------------------------------

%}

%x xcl
%x xcc
%x xd
%x xq


digit                       [0-9]
id                          [a-zA-Z][a-zA-Z0-9_]*
letter						[a-zA-Z_]
alphabetic 					({letter}|[$])
alphanumeric				({alphabetic}|{digit})
quoted_id					\"{id}\"

zero_char             [\0]
horiz_space           [ \t\f]
unix_like_newline     [\n|\r]
non_unix_like_newline [\r\n]
newline               (\r\n?|\n)
//newline               ({unix_like_newline}|{non_unix_like_newline})
non_newline           [^\n\r]
space                 ({horiz_space}|{newline})

whitespace                  {space}
horiz_whitespace            {horiz_space}
whitespace_with_newline     ({horiz_whitespace}*{newline}{whitespace}*)

/* Single quote identifier - not used */
quote						[']
xqstart						{quote}
xqstop						{quote}
xqdouble					{quote}{quote}
xqinside					[^'|\n]+

/* Delimited Double Quote Identifier */
dquote                      [\"]
xdstart                     {dquote}
xdstop                      {dquote}
xddouble                    {dquote}{dquote}
xdinside                    [^"|\n]+

/* C-style Comments */
self                        [,()\[\].;$\:\+\-\*\/\%\^\<\>\=]
xccstart                    \/\*{self}*
xccstop                     \*+\/
xccinside                   (.|\s)*?(?=\*\/)
xccrest						(.|\s)*
/* // [^*\/]+ */

/* One-Line Comments */
xclcomment					"//".*
xclstart                    "//"
xclstop                     {newline}
xclinside                   {non_newline}*

MultiplicityONE			["][1]["]
MultiplicityMANY		["][\*]["]
MultiplicityZEROorONE	["]([0][\.][\.][1])["]
MultiplicityZEROorMORE	["]([1][\.][\.][\*])["]

IDENT 						({alphabetic}({alphanumeric})*)



//  ["][^"][^"]*[(\:\:)][^"][^"]*["]
//  		{ return RET(OSDLParserTokens.NUM_REPOBJECT,rnd.Category.CAT_IDENTIFIER); }  		
//  ["][^"]*["][\.]["][^"]*["]
//  		{ return RET(OSDLParserTokens.NUM_CATOBJECT,rnd.Category.CAT_IDENTIFIER); }  		

REPOBJECT					(["][^"]*(\:\:)[^"]*["]) ;
CATOBJECT					(["][^"]*["][\.]["][^"]*["]) ;

%%

"//".*			%{ return newToken(SapOSDLConstants.NUM_COMMENT2, yytext, rnd.Category.CAT_COMMENT);
				 %}

{xccstart}  		%{ 
	// console.log(yytext);
	this.pushState("xcc");
	remark_start(yytext);
%}

<xcc>{xccstop}      %{  // console.log(yytext);
    yy_.match 				= remark_get(yytext);
	token_start();
	this.popState();	// remove state from stack
    return newToken(SapOSDLConstants.NUM_COMMENT1, yy_.match, rnd.Category.CAT_COMMENT); // return token with quoted string
%}

<xcc>{xccinside}    %{  // console.log(yytext);
	remark_add(yytext); 
%}

<xcc>{xccrest}      %{  // console.log(yytext);
    yy_.match 				= remark_get(yytext);
	token_start();
	this.popState();	// remove state from stack
    return newToken(SapOSDLConstants.NUM_COMMENT1, yy_.match, rnd.Category.CAT_COMMENT, rnd.ErrorState.Erroneous); // return token with quoted string
%}
    
<xcc><<EOF>>        %{  // console.log(yytext);
	this.popState();
    return newToken(SapOSDLConstants.NUM_EOF, SapOSDLConstants.EOF, rnd.Category.CAT_WS);
%}


{MultiplicityONE}			%{ // console.log(yytext);
							return newMultiplicityToken( yytext, this.TIR ); %}        
{MultiplicityMANY}			%{ // console.log(yytext);
							return newMultiplicityToken( yytext, this.TIR ); %}        
{MultiplicityZEROorONE}		%{ // console.log(yytext);
							return newMultiplicityToken( yytext, this.TIR ); %}        
{MultiplicityZEROorMORE}	%{ // console.log(yytext);
							return newMultiplicityToken( yytext, this.TIR ); %}        

{REPOBJECT}					%{ // console.log(yytext);
								return newToken( SapOSDLConstants.NUM_REPOBJECT, yytext, rnd.Category.CAT_IDENTIFIER);
							%}
							
{CATOBJECT}					%{ // console.log(yytext);
								return newToken( SapOSDLConstants.NUM_CATOBJECT, yytext, rnd.Category.CAT_IDENTIFIER);
							%}
																											
//{quoted_id}					%{ // console.log(yytext); // return {"lexem":yytext,"token":"#QUOTED_ID#"};
//								return newToken(this.TIR.getTokenIndex("#QUOTED_ID#"), yytext, rnd.Category.CAT_IDENTIFIER); %}

// DQUOTED_ID
{xdstart}           %{
    this.pushState("xd");
    literal_start('"');
%}

<xd>{xdstop}        %{
    yy_.match = literal_get('"');
    token_start();
	this.popState();	// remove state from stack
    return newToken(SapOSDLConstants.NUM_QUOTED_ID, yy_.match, rnd.Category.CAT_IDENTIFIER); // return token with quoted string
%}

<xd>{xddouble}      %{
    quoted_id_add(yytext);
%}

<xd>{xdinside}      %{
   quoted_id_add(yytext);
%}

<xd>{newline}		%{
    yy_.match = literal_get('');
    token_start();
	this.popState();	// remove state from stack
    return newToken(SapOSDLConstants.NUM_QUOTED_ID, yy_.match, rnd.Category.CAT_IDENTIFIER, rnd.ErrorState.Erroneous); // return Err token w/o quoted string
%}

<xd><<EOF>>         %{
    this.popState();
    return newToken(SapOSDLConstants.NUM_EOF, SapOSDLConstants.EOF, rnd.Category.CAT_WS);
%}
// DQUOTED_ID

//++ QUOTED_ID -- MARK AS ERRORNEOUS
{xqstart}           %{
    this.pushState("xq");
    literal_start("'");
%}

<xq>{xqstop}        %{
    yy_.match = literal_get("'");
    token_start();
	this.popState();	// remove state from stack
    return newToken(SapOSDLConstants.NUM_ID, yy_.match, rnd.Category.CAT_IDENTIFIER, rnd.ErrorState.Erroneous); // return token with quoted string
%}

<xq>{xqdouble}      %{
    quoted_id_add(yytext);
%}

<xq>{xqinside}      %{
   quoted_id_add(yytext);
%}

<xq>{newline}		%{
    yy_.match = literal_get('');
    token_start();
	this.popState();	// remove state from stack
    return newToken(SapOSDLConstants.NUM_ID, yy_.match, rnd.Category.CAT_IDENTIFIER, rnd.ErrorState.Erroneous); // return Err token w/o quoted string
%}

<xq><<EOF>>         %{
    this.popState();
    return newToken(SapOSDLConstants.NUM_EOF, SapOSDLConstants.EOF, rnd.Category.CAT_WS, rnd.ErrorState.Erroneous);
%}
//-- DQUOTED_ID */

{IDENT}						%{ // console.log(yytext);
								return newIdToken( yytext, this.TIR );
							%}	
"."                         %{ // console.log(yytext); 
								return newToken(SapOSDLConstants.NUM_DOT, yytext, rnd.Category.CAT_OPERATOR); %}
","                         %{ // console.log(yytext);
								return newToken(SapOSDLConstants.NUM_COMMA, yytext, rnd.Category.CAT_OPERATOR); %}
"{"                         %{ // console.log(yytext);
								return newToken(SapOSDLConstants.NUM_LCURLY, yytext, rnd.Category.CAT_OPERATOR); %}
"}"                         %{ // console.log(yytext);
								return newToken(SapOSDLConstants.NUM_RCURLY, yytext, rnd.Category.CAT_OPERATOR); %}
"("                         %{ // console.log(yytext);
								return newToken(SapOSDLConstants.NUM_LPAREN, yytext, rnd.Category.CAT_OPERATOR); %}
")"                         %{ // console.log(yytext);
								return newToken(SapOSDLConstants.NUM_RPAREN, yytext, rnd.Category.CAT_OPERATOR); %}
":"							%{ // console.log(yytext);
								return newToken(SapOSDLConstants.NUM_COLON, yytext, rnd.Category.CAT_OPERATOR); %}
";"                         %{ // console.log(yytext);
								return newToken(SapOSDLConstants.NUM_SEMICOLON, yytext, rnd.Category.CAT_OPERATOR); %}
{newline}		/* skip New Line */
{horiz_space}	/* skip whitespace */
{zero_char}     /* Skip Zero character */	
<INITIAL><<EOF>>            %{ //return 'ENDOFFILE';
								return newToken(SapOSDLConstants.NUM_EOF, SapOSDLConstants.EOF, rnd.Category.CAT_WS); %}
