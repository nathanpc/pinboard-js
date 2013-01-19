# pinboard.js

The [Pinboard](http://pinboard.in/) library for Javascript.


## Examples

You can find the basic examples inside the `examples` folder. Anyway, here's an example of how to list the user's bookmarks:

```javascript
var pinboard = new Pinboard("username");
pinboard.login("password", function (token, error) {
	if (error) {
		return alert("ERROR: " + error.status + " - " + error.message);
	}

	pinboard.list_posts(function (posts, error) {
		console.log(posts);
		for (var i = 0; i < posts.length; i++) {
			document.getElementById("list").innerHTML += "<li><a href=\"" + posts[i].href + "\">" + posts[i].description + "</a></li>";
		}
	}, [{ name: "results", value: "3"}]);  // Optional array of parameters.
});
```


## How to extend the library

This library is extremely simple if you look at the source code. All it does is call `Pinboard.request` which abstracts the URL into a more Javascript-friendly thing. If you want to call something that the API doesn't cover you can use it to extend the API. You can learn more about the `Pinboard.request` function by looking at the [awesome documentation](http://nathanpc.github.com/pinboard-js/).