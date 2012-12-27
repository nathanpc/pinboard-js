/**
 *	pinboard.js - A Pinboard library
 *	@author Nathan Campos <nathanpc@dreamintech.net>
 */


/**
 *	Pinboard class.
 *	@constructor
 *
 *	@param {String} username - The username
 *	@param {String} [proxy] - A proxy URL for Cross-Domain requests
 */
function Pinboard(username, proxy) {
	if (!proxy) {
		proxy = "";
	}

	this.username = username;
	this.auth_token = null;
	this.proxy = proxy;
	this.server_url = this.proxy + "https://api.pinboard.in/v1";
}

/**
 *	AJAX helper function. I'm using this just to keep the library code clean.
 *
 *	@param {String} method - The HTTP method for the request.
 *	@param {String} params - Pinboard API URL parameters.
 *	@param {String} body - Body of a POST request. (Use null if there's none)
 *	@param {Function} statechange(req) - XMLHttpRequest.onreadystatechange
 */
Pinboard.prototype.request = function (method, params, body, statechange) {
	var url = this.server_url + params + "?auth_token=" + this.username + ":" + this.auth_token + "?format=json";
	var req = new XMLHttpRequest();

	req.onreadystatechange = function () {
		if (req.readyState === 4) {
			statechange(req);
		}
	};
	
	req.open(method, url, true);
	req.send(body);
}

/**
 *	Login the user and gets the authentication token.
 *
 *	@param {String} password - The user password
 *	@param {Function} callback(auth_token, error) - Returns the authentication token or a error
 */
Pinboard.prototype.login = function (password, callback) {
	var url = this.proxy + "https://" + this.username + ":" + password + "@api.pinboard.in/v1/user/api_token/?format=json";
	var req = new XMLHttpRequest();
	var outer_scope = this;
	
	req.onreadystatechange = function () {
		if (req.readyState === 4) {
			if (req.status === 200) {
				// You're logged in!
				var token = JSON.parse(req.responseText).result;

				outer_scope.auth_token = token;
				callback(token);
			} else if (req.status === 401) {
				// Looks like someone typed the wrong user/pass combination.
				callback(null, {
					status: 401,
					message: "The username or password you've entered are incorrect."
				});
			}
		}
	};
	
	req.open("GET", url, true);
	req.send(null);
}