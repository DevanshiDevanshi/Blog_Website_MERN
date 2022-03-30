const Sequelize = require('sequelize');

var sequelize = new Sequelize('d2sha63jj8v3c', 'ishgldraqgtebf', '56341565d275ff933222efdd5bd2676913cc9406461177348c84f325582308d6', {
    host: 'ec2-52-73-155-171.compute-1.amazonaws.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

// defining  post model

var Post = sequelize.define('Post',{
    PostID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true 
    },
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN

});

// defining category model

var  Category = sequelize.define('Category',{
    CategoryID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true 
    },
    category: Sequelize.STRING
});

Post.belongsTo(Category, {foreignKey: 'category'});

module.exports.Initialize = function () {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            resolve();
        }).catch((error) => {
            console.log(error);
            reject("Unable to sync the database!");
        })
    })
}

module.exports.getAllPosts = function () {
    return new Promise((resolve, reject) => {
        Post.findAll().then((data) => {
            resolve(data);
        })
        .catch((error) => {
            console.log(error)
            reject('no results returned')
        })
    })
}


module.exports.getPostsByCategory = function (Specicategory) {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
               CategoryID: Specicategory ,
               include: [{model: Category}],raw:true
            }
            
        }).then((data)=>{
            resolve(data);
        }).catch((error) =>{
            console.log('no results returned');
            console.log(error);
        })
    })
}

module.exports.getPostsByMinDate = function (minDateStr) {
    return new Promise((resolve, reject) => {
        const { gte } = Sequelize.Op;

        Post.findAll({
            where: {
                postDate: {
                    [gte]: new Date(minDateStr)
                }
            }
        }).then((data)=>{
            resolve(data);
        }) .catch((error) =>{
            console.log('no results returned');
            reject('No results in return | Error:' + err);
        })      
    })
}


module.exports.getPostsById = function (SpeciID) {
    return new Promise((resolve, reject) => {
        Post.find({
            where: {
               Postid : SpeciID 
            }
        }).then((data)=>{
            resolve(data);
        }).catch((error) =>{
            console.log('no results returned');
            reject('No results in return | Error:' + err);
        })
    })
}

module.exports.addPost = function (postData) {
    return new Promise((resolve, reject) => {
        postData.published = (postData.published) ? true : false;

        for (let i in postData) {
            if (postData[i] == "") { postData[i] = null; }
        }

        postData.postDate = new Date();

        Post.create(postData)
            .then(resolve(Post.findAll()))
            .catch(reject('Unable to create the post'))
    })
    
}


module.exports.getPublishedPosts = function () {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where:{
                published: true
            }
        }).then((data) =>{
            resolve(data);
        }).catch((error)=>{
            console.log('no results returned');
            reject('published = true returned nothing')
        })
    })
}

module.exports.getPublishedPosts = function (){
    return new Promise((resolve, reject) => {
        Post.findAll({ where: published == true })
            .catch((error) => {
                reject("no results returned")
            });
    });
}

module.exports.getPublishedPostsByCategory = function(category){
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                published: true,
                category: category
            }
        })
        .then(data => resolve(data))
        .catch(err => reject('No results'))
       });
}

module.exports.getCategories = function () {
    return new Promise((resolve, reject) => {
        Category.findAll().then((data)=>{
            resolve(data);
        }).catch((error)=>{
            console.log('no results returned');
            reject();
        })
    })
}











