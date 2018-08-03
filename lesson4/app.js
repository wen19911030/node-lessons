const express = require("express");
const request = require("superagent");
const cheerio = require("cheerio");
const eventproxy = require("eventproxy");
const url = require("url");

const app = express();
const EP = new eventproxy();

// var fs = require("fs");
// var path = require("path");

app.get("/", (req, res, next) => {
	let cnodeUrl = "https://cnodejs.org/";
	request.get(cnodeUrl).end((err, sers) => {
		if (err) {
			return next(err);
		}
		const $ = cheerio.load(sers.text);
		let items = [];
		const topicUrls = [];
		// 获取首页所有的链接
		$("#topic_list .topic_title").each(function(idx, element) {
			var $element = $(element);
			// $element.attr('href') 本来的样子是 /topic/542acd7d5d28233425538b04
			// 我们用 url.resolve 来自动推断出完整 url，变成
			// https://cnodejs.org/topic/542acd7d5d28233425538b04 的形式
			// 具体请看 http://nodejs.org/api/url.html#url_url_resolve_from_to 的示例
			var href = url.resolve(cnodeUrl, $element.attr("href"));
			topicUrls.push(href);
		});

		topicUrls.forEach(url => {
			request.get(url).end((err, content) => {
				EP.emit("get_detail", [url, content]);
			});
		});

		EP.after("get_detail", topicUrls.length, list => {
			items = list.map((item, index) => {
				let href = item[0];
				// fs.writeFile(path.join(__dirname, `text${index}.txt`), item[1].text, function(err) {
				// 	if (err) {
				// 		console.log(err);
				// 	} else {
				// 		console.log("file writes sucess!!");
				// 	}
				// });
				// 可能未获取到数据
				const $ = cheerio.load(item[1].text);
				let title = $(".topic_full_title")
					.text()
					.trim();
				let comment1 = $(".reply_item .markdown-text p")
					.text()
					.trim();
				return {
					title,
					href,
					comment1
				};
			});
			res.send(items);
		});
	});
});

app.listen(3000, () => {
	console.log("app is listening at port 3000");
});
