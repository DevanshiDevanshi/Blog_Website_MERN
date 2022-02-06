const blogService = require("./blog-service") 
const path =  require("path")
const express = require("express");
const app = express();
const HTTP_PORT = process.env.PORT || 8080;
function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}
app.use(express.static('public')); // required dont delete this( used for static files-like images)

// setup a 'route' to listen on the default url path (http://localhost)
app.get("/", function(req,res){
    res.redirect("/about");
});

// setup another route to listen on /about
app.get("/about", function(req,res){
    res.sendFile(path.join(__dirname,"/views/about.html"));
  });

// update here to send json objects back
 app.get('/blog',function(req,res){
  blogService.getPublishedPosts().then((data) =>{
    res.send(data);
  }).catch((error) =>{
    console.log(error);
    res.status(404).send("ERROR!!");
  } )
 }); 

 app.get("/posts",function(req,res){
  blogService.getAllPosts().then((data) =>{
    res.send(data);
  }).catch((error) =>{
    console.log(error);
    res.status(404).send("ERROR!!");
  } )

  }); 

  app.get("/categories",function(req,res){
    blogService.getCategories().then((data) =>{
      res.send(data);
    }).catch((error) =>{
      console.log(error);
      res.status(404).send("ERROR!!");
    } )
  
  }); 

  app.all('/*', (req, res) => {
  res.send("404 - Page not found");
})

// setup http server to listen on HTTP_PORT
blogService.Initialize().then(() => { 
  app.listen(HTTP_PORT, onHttpStart);
}).catch(()=>{
   console.log("OOPS NO DATA TO DISPLAY!")
  })

  