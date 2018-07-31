const express = require("express");
const request = require("superagent");
const cheerio = require("cheerio");
const async = require("async");
const url = require("url");
const fs = require("fs");
const path = require("path");

const app = express();

app.get("/", (req, res, next) => {
  const baseUrl = "https://cnodejs.org/";
  request.get(baseUrl).end((err, content) => {
    if (err) {
      return next(err);
    }
    const $ = cheerio.load(content.text);
    const topicUrls = [];
    $("#topic_list .topic_title").each((index, item) => {
      const href = url.resolve(baseUrl, $(item).attr("href"));
      topicUrls.push(href);
    });

    async.mapLimit(
      topicUrls,
      5,
      function(item, callback) {
        fetchUrl(item, callback);
      },
      function(err, results) {
        console.log(123);
        if (err) {
          console.log("err");
        }
        const items = results.map(item => {
          let href = item[0];
          let $ = cheerio.load(item[1]);
          let title = $(".topic_full_title")
            .text()
            .trim();
          let comment1 = $(".reply_item .reply_content  p")
            .eq(0)
            .text()
            .trim();
          return {
            title,
            href,
            comment1
          };
        });
        fs.writeFile("./results.txt", JSON.stringify(items), err => {
          console.log("write ok");
        });
        res.send(items);
      }
    );
  });
});

let concurrencyCount = 0;
function fetchUrl(url, callback) {
  concurrencyCount++;
  request.get(url).end((err, res) => {
    concurrencyCount--;
    callback(null, [url, res.text]);
  });
}

app.listen(3000, () => {
  console.log("node start");
});
