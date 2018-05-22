var MongoClient = require('mongodb').MongoClient;
var setting = require('./setting');

var url = setting.dburl;
var dbName = setting.dbname;

exports.insertOne = insertOne;
exports.find = find;
exports.deleteMany = deleteMany;
exports.updateMany = updateMany;

function _connectDB(callback){
    MongoClient.connect(url, function(err, db) {
        callback(err, db);
    });
};

function insertOne(collectionName,json,callback){
    if(arguments.length != 3){
        callback("insertOne函数当参数必须为三个",null);
        return;
    }
    _connectDB(function(err,client){
        var db = client.db(dbName);
        var collection = db.collection(collectionName);
        collection.insertOne(json,function(err,result){
            callback(err,result);
            client.close;
        });
    });
}

/**
 *
 * @param collectionName 集合类似表名
 * @param json 查询条件，{name:"jack"}
 * @param args 传入参数1、pageamount 分页中的数据条数；2、page 第几页；3、sort：{"age":1}、age升序
 *          {"age":-1}、age降序
 * @param callback
 */
function find(collectionName,json,args,callback){
    if(arguments.length == 3){
        var skipnumber = 0;
        var limit = 0;
        var callback = args;
    }else if(arguments.length == 4){
        var skipnumber = args.pageamount * args.page || 0;
        var limit = args.pageamount || 0;
        var sort = args.sort || {};
    }else{
        throw new Error("find函数当参数必须为三个或者四个",null);
        return;
    }
    // console.log("skipnumber:"+skipnumber);
    // console.log("limit:"+limit);
    _connectDB(function(err,client){
        var db = client.db(dbName);
        var collection = db.collection(collectionName);
        collection.find(json).skip(skipnumber).limit(limit).sort(sort).toArray(function(err, docs) {
            // console.log("Found the following records");
            // console.log(docs);
            callback(err,docs);
            client.close;
        });
    });
}
function deleteMany(collectionName,json,callback){
    _connectDB(function(err,client) {
        var db = client.db(dbName);
        var collection = db.collection(collectionName);
        collection.deleteMany(json,function(err,result){
            callback(err,result);
            client.close;
        });
    });
}

function updateMany(collectionName,condition,change,callback){
    if(arguments.length != 4){
        callback("find函数当参数必须为三个",null);
        return;
    }
    _connectDB(function(err,client) {
        var db = client.db(dbName);
        var collection = db.collection(collectionName);
        collection.updateMany(condition
            , { $set: change }, function(err, result) {
                callback(err,result);
                client.close;
            });
    });
}

function getAllCount(collectionName,callback){
    _connectDB(function(err,client) {
        var db = client.db(dbName);
        var collection = db.collection(collectionName);
        collection.count({}).then(function(count){
            callback(count);
            client.close();
        })
    })
}