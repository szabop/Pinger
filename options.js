var Options = function() {

} ;

Options.prototype.load = function(fnConfig) {
	var self = this ;
	chrome.storage.local.get({
		interval: 5000,
		version: 1,
		references: ["GOOGLE|https://google.com", "INDEX|http://index.hu"],
		urls: ["SZANALMAS|http://szanalmas.hu"],
	},
	function(oItems) {
		fnConfig.call(null, oItems, self) ;
	}) ;
} ;

Options.prototype.pack = function(oConfig) {
	var fnJoinURL = function(aUrls) {
		aUrls = aUrls || [] ;
		var aJoinedUrls = [] ;
		for(var i=0; i<aUrls.length; i++) {
			var sElement = aUrls[i].key+'|'+aUrls[i].url ;
			aJoinedUrls.push(sElement) ;
		}
		return aJoinedUrls ;
	}

	var oCfg = {
		interval: oConfig.interval || 5000,
		version: oConfig.version || 1,
		references: aJoinedUrls(oConfig.references),
		urls: aJoinedUrls(oConfig.urls)
	} ;	

	return oCfg ;
} ;

Options.prototype.unpack = function(oCfg) {
	var fnSplitURL = function(aUrls) {
		aUrls = aUrls || [] ;
		var oSplitUrls = {} ;
		for(var i=0; i<aUrls.length; i++) {
			var aHack = aUrls[i].split('|') ;
			var sKey = aHack[0] || '<ERROR>' ;
			aHack.shift(1) ;
			var sUrl = aHack.join('|') || '<ERROR>';

			oSplitUrls[sKey]= sUrl ;
		}
		return oSplitUrls ;
	} ;

	// @TODO: Use some object copy thing here...
	oConfig = {
		interval: oCfg.interval,
		version: oCfg.version,
		urls: fnSplitURL(oCfg.urls || []),
		references: fnSplitURL(oCfg.references || [])
	} ;
	
	return oConfig ;
} ;

Options.prototype.store = function(oCfg) {
	// {
		// interval: 5000,
		// version: 1,
		// references: [{key: key, url: url}, ...]
		// urls: [{key: key, url: url}, ...]
	// }

	chrome.storage.local.set(oCfg) ;
} ;



