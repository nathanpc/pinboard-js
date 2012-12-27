/**
 *	pinboard.js - A Pinboard library
 *	@author Nathan Campos <nathanpc@dreamintech.net>
 */


/**
 *	Pinboard class.
 *	@constructor
 *
 *	@param {String} username - The username
 *	@param {String} password - The password
 *	@param {String} [req_proxy] - A proxy URL for Cross-Domain requests
 */
function Pinboard(username, password, req_proxy) {
	if (!req_proxy) {
		req_proxy = "";
	}

	this.username = username;
	this.password = password;
	this.req_proxy = req_proxy;
	this.server_url = this.req_proxy + "https://" + username + ":" + password + "@api.pinboard.in/v1";
}

/**
 *	AJAX helper function. I'm using this just to keep the library code clean.
 *
 *	@param {String} method - The HTTP method for the request.
 *	@param {String} params - Pinboard API URL parameters.
 *	@param {String} body - Body of a POST request. (Use null if there's none)
 *	@param {Function} statechange - XMLHttpRequest.onreadystatechange
 */
Pinboard.prototype.request = function (method, params, body, statechange) {
	var req = new XMLHttpRequest();
	req.onreadystatechange = function () {
		statechange(req);
	};
	
	req.open(method, this.server_url + params, true);
	req.send(body);
}

/**
 *	
 */
/*Pinboard.prototype.login = function (username, password, callback) {
	this.request("GET", "/", null, function (req) {
		if (req.readyState === 4) {
			if (req.status === 200) {
				
			}
		}
	});

	callback(token, error);
}*/