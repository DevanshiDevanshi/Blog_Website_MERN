/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Devanshi Student ID: 153814207 Date: 5th feb 2022
*
*  Online (Heroku) URL:
 https://young-retreat-24542.herokuapp.com/about
*
*  GitHub Repository URL: 
https://github.com/DevanshiDevanshi/web322-app
*
********************************************************************************/
const multer = require("multer");

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'devanshi',
  api_key: '575723235684766',
  api_secret: 'Q3gl0VFgyEIZZHmRIaGX210UyM0',
  secure: true
});
const upload = multer();
const streamifier = require('streamifier');

const blogService = require("./blog-service");

const path = require("path");
const express = require("express");
const app = express();
const HTTP_PORT = process.env.PORT || 8080;
function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}
app.use(express.static('public')); // required dont delete this( used for static files-like images)

// setup a 'route' to listen on the default url path (http://localhost)
app.get("/", function (req, res) {
  res.redirect("/about");
});

// setup another route to listen on /about
app.get("/about", function (req, res) {
  res.sendFile(path.join(__dirname, "/views/about.html"));
});

// update here to send json objects back
app.get('/blog', function (req, res) {
  blogService.getPublishedPosts().then((data) => {
    res.send(data);
  }).catch((error) => {
    console.log(error);
    res.status(404).send("ERROR!!");
  })
});

app.get("/posts", function (req, res) {
  if (req.query.category) {
    blogService.getPostsByCategory(req.query.category).then((data) => {
      res.send(data);
    }).catch((error) => {
      console.log(error);
      res.status(404).send("ERROR!!");
    })
  } else if (req.query.minDate) {
    blogService.getPostsByMinDate(req.query.minDate).then((data) => {
      res.send(data);
    }).catch((error) => {
      console.log(error);
      res.status(404).send("ERROR!!");
    })
  } else {
    blogService.getAllPosts().then((data) => {
      res.send(data);
    }).catch((error) => {
      console.log(error);
      res.status(404).send("ERROR!!");
    })
  }

});

app.get("/categories", function (req, res) {
  blogService.getCategories().then((data) => {
    res.send(data);
  }).catch((error) => {
    console.log(error);
    res.status(404).send("ERROR!!");
  })

});

app.get("/posts/add", function (req, res) {
  res.sendFile(path.join(__dirname, "/views/addPost.html"));
});

app.post("/posts/add", upload.single("featureImage"), function (req, res) {

  let streamUpload = (req) => {
    return new Promise((resolve, reject) => {
      let stream = cloudinary.uploader.upload_stream(
        (error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        }
      );

      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });
  };

  async function upload(req) {
    let result = await streamUpload(req);
    console.log(result);
    return result;
  }

  upload(req).then((uploaded) => {
    req.body.featureImage = uploaded.url;

    // TODO: Process the req.body and add it as a new Blog Post before redirecting to /posts
    blogService.addPost(req.body).then((req) => {
      console.log(req.body);
      res.redirect("/posts");
    }).catch(err => {
      res.status(500).send(err);
    })

  });


});

app.all('/*', (req, res) => {
  res.send("404 - Page not found");
});

// setup http server to listen on HTTP_PORT
blogService.Initialize().then(() => {
  app.listen(HTTP_PORT, onHttpStart);
}).catch(() => {
  console.log("OOPS NO DATA TO DISPLAY!")
})

