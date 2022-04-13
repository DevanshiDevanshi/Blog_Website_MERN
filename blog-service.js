const Sequelize = require('sequelize');

var sequelize = new Sequelize('d43a8a4smu66mk', 'bixcitjchxnzkd', '34ab7014b3f8020a639f9fb2d466299b5cd338336a4564b0a6871e9a6afce0bb', {
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
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN

});

// defining category model

var  Category = sequelize.define('Category',{
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
               id : Specicategory ,
              
            },
            include: [{model: Category}],raw:true
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
               id : SpeciID 
            }
        }).then((data)=>{
            resolve(data[0]);
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

// module.exports.getPublishedPosts = function (){
//     return new Promise((resolve, reject) => {
//         Post.findAll({ 
//             where:{
//                 published: true
//             } 
//             }).then((data) =>{
//                 resolve(data);
//             })
//             .catch((error) => {
//                 reject("no results returned")
//             });
//     });
// }

module.exports.getPublishedPostsByCategory = function(Specicategory){
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                published: true,
                category: Specicategory,
                
            },
            include: [{model: Category}],raw:true
        })
        .then((data) =>{
            resolve(data);
        }).catch(err => reject('No results'))
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

module.exports.addCategory = (categoryData) => {
    return new Promise((resolve, reject) => {
        for (let i in categoryData) {
            if (categoryData[i] == "") { categoryData[i] = null; }
        }
        Category.create(categoryData)
            .then(resolve())
            .catch(reject('unable to create Category'))

    })
}

module.exports.deleteCategoryById = (Specid) => {
    return new Promise((resolve, reject) => {
        Category.destroy({
                where: { 
                id: Specid 
            }}).then(resolve())
            .catch((err) => reject(err))
    })
}

module.exports.deletePostById = (Specid) => {
    return new Promise((resolve, reject) => {
        Post.destroy({
            where: {
            id: Specid
         }}).then(resolve()).catch(err => reject(err))

    })
}










