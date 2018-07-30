const express = require("express");
const md5 = require("md5");
const app = express();

app.get("/", (req, res) => {
	let q = req.query.q || "";
	res.send(md5(q));
	// app.send();
});

app.listen(3000, function() {
	console.log("app is listening at port 3000");
});
