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
 *	@param {Boolean} [encode_url] - Encode the URL (Required for some proxy scripts)
 */
function Pinboard(username, proxy, encode_url) {
	if (!proxy) {
		proxy = "";
	}
	
	if (encode_url === undefined) {
		encode_url = false;
	}

	this.username = username;
	this.auth_token = null;
	this.proxy = proxy;
	this.encode_url = encode_url;
	this.server_url = "https://api.pinboard.in/v1";
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
	if (this.auth_token === null) {
		return console.error("You still haven't logged in.");
	}

	var url = this.server_url + params + "?auth_token=" + this.username + ":" + this.auth_token + "&format=json";
	var req = new XMLHttpRequest();
	
	if (params.indexOf("?") !== -1) {
		url = this.server_url + params + "&auth_token=" + this.username + ":" + this.auth_token + "&format=json";
	}

	if (this.encode_url) {
		url = this.proxy + encodeURIComponent(url);
	} else {
		url = this.proxy + url;
	}

	req.onreadystatechange = function () {
		if (req.readyState === 4) {
			statechange(req.status, JSON.parse(req.responseText));
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
	
	if (this.encode_url) {
		url = this.proxy + encodeURIComponent("https://" + this.username + ":" + password + "@api.pinboard.in/v1/user/api_token/?format=json");
	}
	
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

/**
 *	List the user's posts
 *
 *	@param {Function} callback - Returns the posts JSON
 *	@param {Object} [params] - /posts/all optinal parameters
 */
Pinboard.prototype.list_posts = function (callback, params) {
	this.request("GET", "/posts/all", null, function (status, response) {
		if (status === 200) {
			// Got your posts
			callback(response);
		} else if (status === 429) {
			// Stop requesting!
			callback(null, {
				status: status,
				message: "Too many requests. Try again in 5 minutes."
			});
		}
	});
}