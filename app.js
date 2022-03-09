require("dotenv").config();
const express = require("express");
const app = express();
const validURL = require("valid-url");
const bodyParser = require("body-parser");
// const mongo = require("mongodb");
const mongoose = require("mongoose");
const cors = require("cors");
const shortId = require("shortid");

const mongo_URI = process.env.MONGO_URI;
mongoose.connect(mongo_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let conn = mongoose.connection;
conn.once("open", () => {
  console.log("successfully connected to database");
});

const Schema = mongoose.Schema;
let urlSchema = new Schema({
  original_url: String,
  short_url: String,
});
let URL = mongoose.model("URL", urlSchema);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors({ optionsSuccessStatus: 200 }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  mongoose.connect(mongo_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/shorturl", (req, res) => {
  const { url } = req.body;
  let short = shortId.generate(1000);
  if (!validURL.isWebUri(url)) res.json({ error: "invalid url" });
  else {
    URL.findOne({ original_url: url }, (err, data) => {
      if (data !== null)
        res.json({
          original_url: data.original_url,
          short_url: data.short_url,
        });
      else {
        let obj = new URL({
          original_url: url,
          short_url: short,
        });
        obj.save();
        res.json({ original_url: obj.original_url, short_url: obj.short_url });
      }
    });
  }
});

app.get("/api/shorturl/:short_url", (req, res) => {
  let shortUrl = req.params.short_url;
  URL.findOne({ short_url: shortUrl }, (err, data) => {
    if (data !== null) {
      return res.redirect(data.original_url);
    } else {
      res.json({
        error: "No short URL found for the given input, firstly get url",
      });
    }
  });
});

const port = process.env.PORT || 3000;
let listner = app.listen(port, () => {
  console.log(`the project is live on URL http://localhost:${port}`);
});

function isValid(str) {
  var pattern = new RegExp(
    "^(https?:\\/\\/)?" +
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" +
      "((\\d{1,3}\\.){3}\\d{1,3}))" +
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" +
      "(\\?[;&a-z\\d%_.~+=-]*)?" +
      "(\\#[-a-z\\d_]*)?$",
    "i"
  );
  return pattern.test(str);
}
