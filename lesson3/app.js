const express = require("express");
const request = require("superagent");
const cheerio = require("cheerio");
const app = express();

app.get("/", (req, res, next) => {
	request.get("https://cnodejs.org/").end((err, sres) => {
		if (err) {
			return next(err);
		}
		const $ = cheerio.load(sres.text);
		const items = [];
		$("#topic_list .cell").each((i, item) => {
			let author = $(item)
				.find(".user_avatar img")
				.attr("title");
			let title = $(item)
				.find(".topic_title")
				.attr("title");
			let link = $(item)
				.find(".topic_title")
				.attr("href");

			items.push({
				author,
				title,
				link
			});
		});
		res.send(items);
	});
});

app.listen(3000, function() {
	console.log("app is listening at port 3000");
});
