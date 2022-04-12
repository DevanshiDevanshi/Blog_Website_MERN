/*********************************************************************************
*  WEB322 – Assignment 05
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Devanshi Student ID: 153814207 Date: 31st march 2022
*
*  Online (Heroku) URL:
https://young-retreat-24542.herokuapp.com/blog
*
*  GitHub Repository URL: 
https://github.com/DevanshiDevanshi/web322-app
*
********************************************************************************/
const multer = require("multer");
const authData = require("auth-service.js");
const clientSessions = require('client-sessions');
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
app.use(express.urlencoded({ extended: true }));
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
    },

    formatDate: function (dateObj) {
      let year = dateObj.getFullYear();
      let month = (dateObj.getMonth() + 1).toString();
      let day = dateObj.getDate().toString();
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }


  }

}));
app.set('view engine', '.hbs');

app.use(clientSessions({
  cookieName: "session", // this is the object name that will be added to 'req'
  secret: "Devanshi_web322_assignment6", // this should be a long un-guessable string.
  duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
  activeDuration: 1000 * 60 // the session will be extended by this many ms each request (1 minute)
}));

app.use(function(req, res, next) {
  res.locals.session = req.session;
  next();
});

function ensureLogin(req, res, next) {
  if (!req.session.user) {
      res.redirect("/login");
  } else {
      next();
  }
}

app.use(function (req, res, next) {
  let route = req.path.substring(1);
  app.locals.activeRoute = (route == "/") ? "/" : "/" + route.replace(/\/(.*)/, "");
  app.locals.viewingCategory = req.query.category;
  next();
});


// setup a 'route' to listen on the default url path (http://localhost)
app.get("/", function (req, res) {
  res.redirect("/blog");
});

// setup another route to listen on /about
app.get("/about", function (req, res) {
  res.render('about', {
    data: null,
    layout: 'main'
  });
});


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
      console.log(posts);
    } else {
      // Obtain the published "posts"
      posts = await blogService.getPublishedPosts();
      console.log(posts);
    }

    // sort the published posts by postDate
    posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

    // get the latest post from the front of the list (element 0)
    let post = posts[0];

    // store the "posts" and "post" data in the viewData object (to be passed to the view)
    viewData.posts = posts;
    viewData.post = post;

  } catch (err) {
    console.log(viewData);
    viewData.message = "no results";
  }

  try {
    // Obtain the full list of "categories"
    let categories = await blogService.getCategories();

    // store the "categories" data in the viewData object (to be passed to the view)
    viewData.categories = categories;
  } catch (err) {
    console.log(err);
    viewData.categoriesMessage = "no results"
  }

  // render the "blog" view with all of the data (viewData)
  res.render("blog", { data: viewData })

});


app.get("/posts",ensureLogin, function (req, res) {
  if (req.query.category) {
    blogService.getPostsByCategory(req.query.category).then((data) => {
      if (data.length > 0) {
        res.render("posts", { posts: data });
      } else {
        res.render("posts", { message: "no results found" })
      }
    }).catch((error) => {
      console.log(error);
      res.render("posts", { message: "no results" });
    });
  } else if (req.query.minDate) {
    blogService.getPostsByMinDate(req.query.minDate).then((data) => {
      if (data.length > 0) {
        res.render("posts", { posts: data });
      } else {
        res.render("posts", { message: "no results found" })
      }
    }).catch((error) => {
      console.log(error);
      res.render("posts", { message: "no results" });
    })
  } else {
    blogService.getAllPosts().then((data) => {
      if (data.length > 0) {
        res.render("posts", { posts: data });
      } else {
        res.render("posts", { message: "no results found" })
      }
    }).catch((error) => {
      console.log(error);
      res.render("posts", { message: "no results" });

    })
  }

});

app.get("/categories", ensureLogin, function (req, res) {
  blogService.getCategories().then((data) => {
    if (data.length > 0) {
      res.render("categories", { categories: data });
    } else {
      res.render("categories", { message: "no results found" })
    }
  }).catch((error) => {
    console.log(error);
    res.render("categories", { message: "no results" });
  })

});

app.get("/posts/add",ensureLogin, function (req, res) {
  blogService.getCategories().then((categories) => {
    res.render('addPost', { categories: categories });
  }).catch(function (err) {
    res.render('addPost', { categories: [] });
  })

});

app.post("/posts/add",ensureLogin, upload.single("featureImage"), function (req, res) {

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

app.get('/blog/:id',ensureLogin, async (req, res) => {

  // Declare an object to store properties for the view
  let viewData = {};

  try {

    // declare empty array to hold "post" objects
    let posts = [];

    // if there's a "category" query, filter the returned posts by category
    if (req.query.category) {
      // Obtain the published "posts" by category
      posts = await blogData.getPublishedPostsByCategory(req.query.category);
    } else {
      // Obtain the published "posts"
      posts = await blogData.getPublishedPosts();
    }

    // sort the published posts by postDate
    posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

    // store the "posts" and "post" data in the viewData object (to be passed to the view)
    viewData.posts = posts;

  } catch (err) {
    viewData.message = "no results";
  }

  try {
    // Obtain the post by "id"
    viewData.post = await blogData.getPostById(req.params.id);
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    // Obtain the full list of "categories"
    let categories = await blogData.getCategories();

    // store the "categories" data in the viewData object (to be passed to the view)
    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "no results"
  }

  // render the "blog" view with all of the data (viewData)
  res.render("blog", { data: viewData })
});

app.get('/post/:id',ensureLogin, (req, res) => {
  blogService.getPostsById(req.params.id).then(data => {
    res.json(data);
  }).catch(err => {
    res.json({ message: err });
  });
});

app.get("/categories/add",ensureLogin, (req, res) => {
  res.render("addCategory");
})

app.post("/categories/add",ensureLogin, (req, res) => {
  blogService.addCategory(req.body).then(
    res.redirect('/categories')
  ).catch(function (err) {
    res.render({ message: err });
  });
})

app.get("/category/delete/:id",ensureLogin, (req, res) => {
  blogService.deleteCategoryById(req.params.id).then(
    res.redirect('/categories')
  ).catch(function (err) {
    res.status(500).send("Unable to Remove Category / Category not found");
  });
})

app.get("/post/delete/:id",ensureLogin, (req, res) => {
  blogService.deletePostById(req.params.id).then(
    res.redirect('/posts')
  ).catch(function (err) {
    res.status(500).send("Unable to Remove Category / Category not found");
  });
})


// new routes assignment 6
app.get("/login", (req, res) => {
  res.render("login")
})
app.get("/register", (req, res) => {
  res.render("register")
})
app.post("/register", (req, res) => {
  authData.registerUser(req.body)
      .then(() => res.render("register", { successMessage: "User created" }))
      .catch(err => res.render("register", { errorMessage: err, userName: req.body.userName }))
});
app.post("/login", (req, res) => {
  req.body.userAgent = req.get('User-Agent');
  authData.checkUser(req.body)
      .then(user => {
          req.session.user = {
              userName: user.userName,
              email: user.email,
              loginHistory: user.loginHistory
          }
          res.redirect("/posts");
      })
      .catch(err => {
          res.render("login", { errorMessage: err, userName: req.body.userName })
      })
});

app.get("/logout", (req, res) => {
  req.session.reset();
  res.redirect("/");
});

app.get("/userHistory", (req, res) => {
  res.render("userHistory", { user: req.session.user });
})


app.all('/*', (req, res) => {
  res.render('404', {
    data: null,
    layout: 'main'
  });

});

// setup http server to listen on HTTP_PORT
blogData.initialize()
  .then(authData.initialize)
  .then(function () {
    app.listen(HTTP_PORT, function () {
      console.log("app listening on: " + HTTP_PORT)
    });
  }).catch(function (err) {
    console.log("unable to start server: " + err);
  });

