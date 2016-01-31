

///////////////////////////////////////////////////////////////////////
// Pinger
//
///////////////////////////////////////////////////////////////////////

var Pinger = function(sUrl) {
	this.sUrl = sUrl ;
	this.bIsUp = null ;
	this.bIsQueriing = false ;
}

Pinger.prototype.ping = function() {
	var oXmlHttp = new XMLHttpRequest() ;
	var self = this ;
	oXmlHttp.onreadystatechange = function() {
 		self._pingCallback(oXmlHttp) ;
	}
	oXmlHttp.open("HEAD", this.sUrl, true);
    oXmlHttp.send();
    this.mbIsQueriing = true ;
}

Pinger.prototype.isUp = function() {
	return this.bIsUp ;
}

Pinger.prototype.isQueriing = function() {
	return this.bIsQueriing ;
}

Pinger.prototype._pingCallback = function(oXmlHttp) {
	if (oXmlHttp.readyState == XMLHttpRequest.DONE ) {
        if(oXmlHttp.status == 200){
        	this.bIsUp = true ;
        }
        else {
        	this.bIsUp = false ;
        }
        this.bIsQueriing = false ;
    }	
}

Pinger.prototype.getUrl = function() {
	return this.sUrl ;
}


///////////////////////////////////////////////////////////////////////
// Tester
//
///////////////////////////////////////////////////////////////////////
var Tester = (function() {
	var fnEach = function(oObj, fnCallback) {
		for(var sKey in oObj) {
			if(!oObj.hasOwnProperty(sKey)) continue ;
			fnCallback.call(null, oObj[sKey], sKey) ;
		}
	}

	fnTester = function(oConfig) {
		var fnCreatePingers = function(oUrls) {
			oPingers = {} ;
			for(var sKey in oUrls) {
				if(!oUrls.hasOwnProperty(sKey)) continue ;
				oPingers[sKey] = new Pinger(oUrls[sKey]) ;
			}
			return oPingers ;
		} ;

		this.oReferences = fnCreatePingers(oConfig.references) ;
		this.oUrlsToWatch = fnCreatePingers(oConfig.urlsToWatch) ;
	} ;

	fnTester.prototype.ping = function() {
		var fnPing = function(oPinger) {
			oPinger.ping() ;
		} ;
		fnEach(this.oReferences, fnPing) ;
		fnEach(this.oUrlsToWatch, fnPing) ;
	} ;

	fnTester.prototype.isAnyReferenceUp = function() {
		var bAnyUp = false ;
		fnEach(this.oReferences, function(oObj, sKey) {
			bAnyUp = bAnyUp || oObj.isUp() ;
		}) ;
		return bAnyUp ;
	}

	fnTester.prototype.checkUrls = function() {
		if(!this.isAnyReferenceUp()) {
			console.warn("None of the reference sites are up, probably network is out...") ;
			return "NONET" ;
		}
		else {
			var sState = "UP"
			fnEach(this.oUrlsToWatch, function(oObj, sKey) {
				if(oObj.isUp() === false) {
					sState = "DOWN" ;
					console.warn("URL is Down: "+sKey+": "+oObj.getUrl()) ;
				}
			}) ;
			return sState ;
		}
	}

	return fnTester ;
})() ;



///////////////////////////////////////////////////////////////////////
// Display
//
///////////////////////////////////////////////////////////////////////
var Display = function() {

} ;

Display.prototype.setIcon = function(sState) {
	var sIcon = "icon_initializing.png" ;
	switch(sState) {
		case "INIT":
			sIcon = "icon_initializing.png" ;
			break ;
		case "UP":
			sIcon = "icon_up.png" ;
			break ;
		case "DOWN":
			sIcon = "icon_down.png" ;
			break ;
		case "NONET":
			sIcon = "icon_unavailable.png" ;
			break ;
	}
    chrome.browserAction.setIcon({path: sIcon});
    // chrome.browserAction.setBadgeBackgroundColor({color:[208, 0, 24, 255]});
    // chrome.browserAction.setBadgeText({
    //  text: localStorage.unreadCount != "0" ? localStorage.unreadCount : ""
    // });
} ;

Display.prototype.openAlert = function(sText) {
  // chrome.tabs.getAllInWindow(undefined, function(tabs) {
  //   for (var i = 0, tab; tab = tabs[i]; i++) {
  //     if (tab.url && isGmailUrl(tab.url)) {
  //       console.log('Found Gmail tab: ' + tab.url + '. ' +
  //                   'Focusing and refreshing count...');
  //       chrome.tabs.update(tab.id, {selected: true});
  //       return;
  //     }
  //   }
  //   console.log('Could not find Gmail tab. Creating one...');
  //   chrome.tabs.create({url: "https://www.youtube.com/watch?v=hlv672jqbtE"});
  // });
  chrome.tabs.create({url: "https://www.youtube.com/watch?v=hlv672jqbtE"});

} ;


///////////////////////////////////////////////////////////////////////
// Scheduler
//
///////////////////////////////////////////////////////////////////////

var App = function() {
	this.oTester  = null ;
	this.oConfig  = null ;
	this.oOptions = new Options() ;
	this.oDisplay = new Display() ;

	this.oOptions.onChange(this._configChange.bind(this)) ;

} ;

App.prototype.startPolling = function() {
	var self = this ;

	if(this.oConfig === null) {
		this.oOptions.load(function(oCfg) {
			self.oConfig = self.oOptions.unpack(oCfg) ;
			self.startPolling() ;
		}) ;
	}
	else {
		this.oTester = new Tester({
			references: this.oConfig.references,
			urlsToWatch: this.oConfig.urls
		}) ;

		this._scheduledStep() ;

	} ;
} ;

App.prototype.stopPolling = function() {
	if(this.oTimer !== null) {
		clearTimeout(this.oTimer) ;
	}
	this.oTimer = null ;
} ;

App.prototype._configChange = function() {
	console.log("Config change...") ;
	this.oConfig = null ;
	
	if(this.oTimer !== null) {
		this.stopPolling() ;
		this.startPolling() ;
	} ;
} ;

App.prototype._scheduledStep = function() {
	console.info("Background function called!") ;
	this.oTester.ping() ;
	var sState = this.oTester.checkUrls() ;
	this.oDisplay.setIcon(sState) ;

	//
	//
	//
	if(this.sOldState !== "DOWN" && sState === "DOWN") {
		this.oDisplay.openAlert() ;
	} ;
	this.sOldState = sState ;

	this.oTimer = 
		setTimeout(this._scheduledStep.bind(this), this.oConfig.interval) ;
} ;

var oApp = new App() ;
oApp.startPolling() ;