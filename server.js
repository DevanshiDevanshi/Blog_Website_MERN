/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Devanshi Student ID: 153814207 Date: 21st feb 2022
*
*  Online (Heroku) URL:
https://young-retreat-24542.herokuapp.com/
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
const exphbs = require('express-handlebars');
const stripJs = require('strip-js');
const path = require("path");
const express = require("express");
const { setEnvironmentData } = require("worker_threads");
const { mainModule } = require("process");
const app = express();
const HTTP_PORT = process.env.PORT || 8080;
function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}
app.use(express.static('public')); // required dont delete this( used for static files-like images)

//handle bar stuff
app.engine('.hbs', exphbs.engine({
  extname: '.hbs',
  helpers: {
    navLink: function (url, options) {
      return '<li' +
        ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
        '><a href="' + url + '">' + options.fn(this) + '</a></li>';
    },

    equal: function (lvalue, rvalue, options) {
      if (arguments.length < 3)
        throw new Error("Handlebars Helper equal needs 2 parameters");
      if (lvalue != rvalue) {
        return options.inverse(this);
      } else {
        return options.fn(this);
      }
    },

    safeHTML: function (context) {
      return stripJs(context);
    }

  }

}));
app.set('view engine', '.hbs');


app.use(function (req, res, next) {
  let route = req.path.substring(1);
  app.locals.activeRoute = (route == "/") ? "/" : "/" + route.replace(/\/(.*)/, "");
  app.locals.viewingCategory = req.query.category;
  next();
});


// setup a 'route' to listen on the default url path (http://localhost)
app.get("/", function (req, res) {
  res.redirect("/about");
});

// setup another route to listen on /about
app.get("/about", function (req, res) {
  res.render('about', {
    data: null,
    layout: 'main'
  });
});

// update here to send json objects back
// app.get('/blog', function (req, res) {
//   blogService.getPublishedPosts().then((data) => {
//     res.send(data);
//   }).catch((error) => {
//     console.log(error);
//     res.status(404).send("ERROR!!");
//   })
// });

app.get('/blog', async (req, res) => {

  // Declare an object to store properties for the view
  let viewData = {};

  try {

    // declare empty array to hold "post" objects
    let posts = [];

    // if there's a "category" query, filter the returned posts by category
    if (req.query.category) {
      // Obtain the published "posts" by category
      posts = await blogService.getPublishedPostsByCategory(req.query.category);
    } else {
      // Obtain the published "posts"
      posts = await blogService.getPublishedPosts();
    }

    // sort the published posts by postDate
    posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

    // get the latest post from the front of the list (element 0)
    let post = posts[0];

    // store the "posts" and "post" data in the viewData object (to be passed to the view)
    viewData.posts = posts;
    viewData.post = post;

  } catch (err) {
    viewData.message = "no results";
  }

  try {
    // Obtain the full list of "categories"
    let categories = await blogService.getCategories();

    // store the "categories" data in the viewData object (to be passed to the view)
    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "no results"
  }

  // render the "blog" view with all of the data (viewData)
  res.render("blog", { data: viewData })

});


app.get("/posts", function (req, res) {
  if (req.query.category) {
    blogService.getPostsByCategory(req.query.category).then((data) => {
      // res.send(data);
      res.render("posts", { posts: data })

    }).catch((error) => {
      console.log(error);
      //res.status(404).send("ERROR!!");
      res.render("posts", { message: "no results" });
    })
  } else if (req.query.minDate) {
    blogService.getPostsByMinDate(req.query.minDate).then((data) => {
      // res.send(data);
      res.render("posts", { posts: data })
    }).catch((error) => {
      console.log(error);
      // res.status(404).send("ERROR!!");
      res.render("posts", { message: "no results" });
    })
  } else {
    blogService.getAllPosts().then((data) => {
      // res.send(data);
      res.render("posts", {
        posts: data
      })
    }).catch((error) => {
      console.log(error);
      // res.status(404).send("ERROR!!");
      res.render("posts", { message: "no results" });

    })
  }

});

app.get("/categories", function (req, res) {
  blogService.getCategories().then((data) => {
    res.render("categories", {categories: data});
  }).catch((error) => {
    console.log(error);
    res.render("categories", {message: "no results"});
  })

});

app.get("/posts/add", function (req, res) {
  res.render('addPost', {
    data: null,
    layout: 'main'
  });

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

