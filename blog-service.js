const fs = require("fs");
let posts = [];
let categories = [];

module.exports.Initialize = function () {
    return new Promise((resolve, reject) => {
        fs.readFile('./data/posts.json', 'utf8', (error, data) => {
            if (error) {
                reject(error);
                console.log("Unable to read Posts.json file")
            } else {
                posts = JSON.parse(data);
                fs.readFile('./data/categories.json', 'utf8', (error, data) => {
                    if (error) {
                        reject(error);
                        console.log("Unable to read catergories.json file")
                    } else {
                        categories = JSON.parse(data);
                        resolve("Success!!");
                    }
                })
            }

        })
    })
}

module.exports.getAllPosts = function () {
    return new Promise((resolve, reject) => {
        if (posts.length == 0) {
            reject("No results returned");
        }
        else {
            resolve(posts);
        }

    })
}

module.exports.getPublishedPosts = function () {
    return new Promise((resolve, reject) => {
        let publishedTrue = [];
        for (let i = 0; i < posts.length; i++) {
            if (posts[i].published == true) {
                publishedTrue.push(posts[i]);
            }
        }
        if (publishedTrue != []) {
            resolve(publishedTrue);
        } else {
            reject("No results returned");
        }

        // second method with array.filter
        // let publishedTrue = publishedTrue.filter(posts => posts.published == true );
        //  if(publishedTrue != []){
        //     resolve(publishedTrue);
        //  }else{
        //    reject("No results returned");
        //  }

    })
}

module.exports.getCategories = function () {
    return new Promise((resolve, reject) => {
        if (categories.length == 0) {
            reject("No results returned");
        }
        else {
            resolve(categories);
        }

    })
}


module.exports.addPost = function (postData) {
    return new Promise((resolve, reject) => {
        if (typeof postData.published === 'undefined') {
            postData.published = false;
        } else {
            postData.published = true;
        }
        postData.id = posts.length + 1;
        posts.push(postData);
        resolve(postData);
    });
}

module.exports.getPostsByCategory = function (Specicategory) {
    return new Promise((resolve, reject) => {
        let PostCatReturned = [];
        for (let i = 0; i < posts.length; i++) {
            if (posts[i].category == Specicategory) {
                PostCatReturned.push(posts[i]);
            }
        }
        if (PostCatReturned.length != 0) {
            resolve(PostCatReturned);
        } else {
            reject("No results returned");
        }
    })
}

module.exports.getPostsById = function (SpeciID) {
    return new Promise((resolve, reject) => {
        let PostIdReturned = {};
        for (let i = 0; i < posts.length; i++) {
            if (posts[i].ID == SpeciID) {
                PostIdReturned.push(posts[i]);
            }
        }
        if (PostIdReturned.length != 0) {
            resolve(PostIdReturned);
        } else {
            reject("No results returned");
        }
    })
}


module.exports.getPostsByMinDate = function (minDateStr) {
    return new Promise((resolve, reject) => {
        let PostMinDateReturn = [];
        for (let i = 0; i < posts.length; i++) {
            if (new Date (posts[i].postDate) >= new Date (minDateStr)) {
                PostMinDateReturn.push(posts[i]);
            }
        }
        if (PostMinDateReturn.length != 0) {
            resolve(PostMinDateReturn);
        } else {
            reject("No results returned");
        }
    })
}

module.exports.getPostsByMinDate = function(){

    return new Promise((resolve, reject) =>{
    let publishedTrue = publishedTrue.filter(posts => posts.published == true && posts.category == category );
         if(publishedTrue != []){
            resolve(publishedTrue);
         }else{
           reject("No results returned");
         }
    })
}