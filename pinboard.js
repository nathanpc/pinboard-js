/**
 *	pinboard.js - A Pinboard library
 *	@author Nathan Campos <nathanpc@dreamintech.net>
 */


/**
 *	Pinboard class.
 *	@constructor
 *
 *	@param {String} username - The username
 *	@param {String} [auth_token=null] - The user's auth token (got with Pinboard.login)
 *	@param {String} [proxy] - A proxy URL for Cross-Domain requests
 *	@param {Boolean} [encode_url] - Encode the URL (Required for some proxy scripts)
 */
function Pinboard(username, auth_token, proxy, encode_url) {
	if (auth_token === undefined) {
		auth_token = null;
	}

	if (!proxy) {
		proxy = "";
	}
	
	if (encode_url === undefined) {
		encode_url = false;
	}

	this.username = username;
	this.auth_token = auth_token;
	this.proxy = proxy;
	this.encode_url = encode_url;
	this.server_url = "https://api.pinboard.in/v1";
}

/**
 *	AJAX helper function. I'm using this just to keep the library code clean.
 *
 *	@param {String} method - The HTTP method for the request.
 *	@param {String} api_method - Pinboard API URL method.
 *	@param {String} params - Pinboard API URL parameters.
 *	@param {String} body - Body of a POST request. (Use null if there's none)
 *	@param {Function} statechange(req) - XMLHttpRequest.onreadystatechange
 */
Pinboard.prototype.request = function (method, api_method, params, body, statechange) {
	if (this.auth_token === null) {
		return console.error("You still haven't logged in.");
	}

	var url = this.server_url + api_method + "?auth_token=" + this.username + ":" + this.auth_token + "&format=json";
	var req = new XMLHttpRequest();
	
	if (params !== null) {
		var param_str = "";
		for (var i = 0; i < params.length; i++) {
			var current_param = params[i];

			if (i === 0) {
				param_str += "?";
			} else {
				param_str += "&";
			}

			param_str += current_param.name + "=" + encodeURIComponent(current_param.value);
		}

		url = this.server_url + api_method + param_str + "&auth_token=" + this.username + ":" + this.auth_token + "&format=json";
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
					message: "The username or password you've entered is incorrect."
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
 *	@param {Array} [params] - /posts/all optinal parameters ({"name": "", "value": ""} format)
 */
Pinboard.prototype.list_posts = function (callback, params) {
	if (params === undefined) {
		params = null;
	}

	this.request("GET", "/posts/all", params, null, function (status, response) {
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

/**
 *	Add a new bookmark
 *
 *	@param {String} url - URL to bookmark
 *	@param {String} description - Bookmark description
 *	@param {Function} callback - The usual (result, error) callback
 *	@param {Array} [params] - /posts/add optinal parameters ({"name": "", "value": ""} format)
 */
Pinboard.prototype.add = function (url, title, callback, params) {
	if (params === undefined) {
		params = [];
	}

	params = [{ name: "url", value: url }, { name: "description", value: title }].concat(params);

	this.request("GET", "/posts/add", params, null, function (status, response) {
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

/**
 *	Remove a bookmark
 *
 *	@param {String} url - URL to bookmark
 *	@param {Function} callback - The usual (result, error) callback
 *	@param {Array} [params] - /posts/add optinal parameters ({"name": "", "value": ""} format)
 */
Pinboard.prototype.delete = function (url, callback, params) {
	params = [{ name: "url", value: url}].concat(params);

	this.request("GET", "/posts/delete", params, null, function (status, response) {
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