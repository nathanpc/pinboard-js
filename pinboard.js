/**
 * pinboard.js
 * A Pinboard library
 * Nathan Campos <nathanpc@dreamintech.net>
 */

var pinboard = {
	req_proxy: "",
	server_url: pinboard.req_proxy + "https://api.pinboard.in/v1",
	request: function (method, params, body, statechange) {
		var req = new XMLHttpRequest();
		req.onreadystatechange = statechange;
		
		req.open(method, pinboard.server_url + params, true);
		req.send(body);
	},
	login: function (username, password, callback) {
		
	
		if (callback !== undefined) {
			callback(token, error);
		}
	}
}