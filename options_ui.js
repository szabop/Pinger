var OptionsUI = function() {
	this.oOptions = new Options() ;

} ;

OptionsUI.prototype.init = function() {
	this.load() ;
} ;

OptionsUI.prototype.load = function() {
	this.oOptions.load(this._onLoaded.bind(this)) ;
} ;

OptionsUI.prototype._onLoaded = function(oCfg, oOptions) {
	document.getElementById('conf-ref-urls-ta').value =
		oCfg.references.join('\n') ;
	document.getElementById('conf-watch-urls-ta').value =
		oCfg.urls.join('\n') ;
} ;

OptionsUI.prototype.save = function() {
	var sReferences = document.getElementById('conf-ref-urls-ta').value ;
	var sUrls = document.getElementById('conf-watch-urls-ta').value ;

	var oCfg = {
		references: sReferences.split('\n'),
		urls: sUrls.split('\n'),
	}
	this.oOptions.store(oCfg) ;
} ;

(function() {
	var optionsUI = new OptionsUI() ;

	document.addEventListener('DOMContentLoaded', optionsUI.init.bind(optionsUI));
	document.getElementById('conf-save-btn').addEventListener(
		'click',
    	optionsUI.save.bind(optionsUI));
	document.getElementById('conf-reset-btn').addEventListener(
		'click',
    	optionsUI.load.bind(optionsUI));
})() ;