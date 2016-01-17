// Copyright (c) 2009-2014 SAP SE, All Rights Reserved
(function(){"use strict";jQuery.sap.declare("sap.ushell.services.SupportTicket");sap.ushell.services.SupportTicket=function(a,c,p,s){var S=(s&&s.config)||{};this.createTicket=function(o){return a.createTicket(o);};this.isEnabled=function(){return S.enabled===true;};};}());
