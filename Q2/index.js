const express = require("express");
const multer = require("multer");
const fs = require("fs");
const port = 3000;

const App = express();

App.set("view engine", "ejs");
App.use(express.static(__dirname + "/public"));

const storage = multer.diskStorage({
  destination: (res, req, callback) => {
    callback(null, "uploads");
  },
  filename: (req, file, callback) => {
    const newFilePrefix = file.fieldname + "_" + Date.now();
    // Get image extension
    var ext = file.originalname.split(".");
    ext = ext[ext.length - 1].toLowerCase();

    // Write data to a json file
    fs.writeFileSync(
      "uploads/" + newFilePrefix + ".json",
      JSON.stringify(req.body)
    );
    // Save the picture
    callback(null, newFilePrefix + "." + ext);
  },
});

const upload = multer({ storage: storage });

App.get("/", (req, res) => {
  res.render("index", { uploaded: req.query.uploaded });
});

App.post("/", upload.single("pic"), (req, res) => {
  if (!req.file) {
    res.redirect("/?uploaded=false");
  } else {
    res.redirect("/?uploaded=true");
  }
});

App.listen(port, () => {
  console.log(
    `Server Listening on port ${port}\nGo to : http://localhost:${port}/`
  );
});
