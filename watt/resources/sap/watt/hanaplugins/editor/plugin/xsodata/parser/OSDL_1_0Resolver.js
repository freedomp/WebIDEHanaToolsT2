make_package("com.sap.adt.tools.xsodata");
// embed rnd packages 
var IByteCode = com.sap.rnd.rndrt.IByteCode;
var IRuleInfo = com.sap.rnd.rndrt.IRuleInfo;
var Token = com.sap.rnd.rndrt.Token;
var FramePtr = com.sap.rnd.rndrt.resolver.base.FramePtr;
var NullFrame = com.sap.rnd.rndrt.resolver.base.NullFrame;
var Parser = com.sap.rnd.rndrt.resolver.base.Parser;
var Stackframe = com.sap.rnd.rndrt.resolver.base.Stackframe;
var UserStackframeT = com.sap.rnd.rndrt.resolver.base.UserStackframeT;
 function OSDL_1_0Resolver(/*IByteCode*/ byte_code, /*OSDLParserRawScannerImpl*/ scanner)
 {  OSDLParserBase.call(this,byte_code, scanner);
/* NullFrame*/ this.m_start_attr = new NullFrame();
}
// "extends
OSDL_1_0Resolver.prototype = Object.create(OSDLParserBase.prototype);
// Begin of user defined implementation:

// End of user defined implementation
// All attribute frames:
// All local Frames
// All Actions
/*Stackframe*/ OSDL_1_0Resolver.prototype.createFrame0 = function(/*int*/ frame_num, /*IRuleInfo*/ rule_info)
{
  switch (frame_num) {
  } // switch
  assert(frame_num >= 0 && frame_num < 86);
  return new UserStackframeT/*<NullFrame, NullFrame>*/(Stackframe.nullFrame, new NullFrame(),  this.m_current.m_BP.ptr(), rule_info); 
}; // method 
//@Override
//protected FramePtr 
OSDL_1_0Resolver.prototype.createFrame = function(/*short*/ frame_num, /*IRuleInfo*/ rule_info)
{
  if (frame_num < 500) {
      return new FramePtr(this.createFrame0(frame_num, rule_info));
  }
  //assert(false);
  return null; // just to shut up warning
}; // method
//}  // class OSDL_1_0Resolver
