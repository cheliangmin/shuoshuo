const formidable = require('formidable');
const db = require("../models/db");
const md5 = require("../models/md5");
const session = require('express-session');
const path = require("path");
const fs = require("fs");
const gm = require("gm")
exports.showIndex = showIndex;
exports.showRegist = showRegist;
exports.doRegist = doRegist;
exports.showLogin = showLogin;
exports.doLogin = doLogin;
exports.showLogout = showLogout;
exports.showSetdetail= showSetdetail;
exports.showDosetdetail = showDosetdetail;
exports.showCut = showCut;
exports.doCut = doCut;
exports.doPost = doPost;
exports.getAllShuoshuo = getAllShuoshuo;
exports.getUserInfo = getUserInfo;

function showIndex(req,res,next){
    console.log(req.session.login);
    var login = req.session.login;
    var username = req.session.username;
    var avatar = req.session.avatar;
    db.find("users",{"username":username},function(err,result){
        if(err){
            console.log(err);
        }
        if(!login){
            avatar = "akari.jpg";
        }else{
            if(result.length == 0){
                avatar = "default.png";
            }else{
                avatar = result[0].avatar;
            }
        }
        db.find("post",{"username":username},{"sort":{"datetime":-1}},function(err,docs){
            res.render("index",{
                "login" : login ? true : false,
                "username" : login ? username : "",
                "active" : "首页",
                "avatar" : avatar,
                "content" : docs
            });
        })
    });

}

function showRegist(req,res,next){
    var login = req.session.login;
    var username = req.session.username;
    var avatar = req.session.avatar;

    res.render("regist",{
        "login" : login ? true : false,
        "username" : login ? username : "",
        "active" : "注册",
        "avatar" : login ? avatar : "akari.jpg"
    });
}

function showLogin(req,res,next){
    var login = req.session.login;
    var username = req.session.username;
    var avatar = req.session.avatar;

    res.render("login",{
        "login" : login ? true : false,
        "username" : login ? username : "",
        "active" : "登陆",
        "avatar" : login ? avatar : "akari.jpg"
    });
}

function showLogout(req,res,next){
    var login = req.session.login = false;
    var username = req.session.username = "";
    var avatar = req.session.avatar = "";

    login = false;
    username = "";

    res.render("index",{
        "login" : login ? true : false,
        "username" : login ? username : "",
        "active" : "首页",
        "avatar" : login ? avatar : "akari.jpg"
    });
}

function showSetdetail(req,res,next){
    var login = req.session.login;
    var username = req.session.username;
    var avatar = req.session.avatar;

    if(!login){
        res.send("设置头像必须登陆");
        return;
    }
    res.render("setdetail",{
        "login" : login ? true : false,
        "username" : login ? username : "",
        "active" : "设置个人资料",
        "avatar" : login ? avatar : "akari.jpg"
    });
}

function showDosetdetail(req,res,next){
    var login = req.session.login;
    var username = req.session.username;
    var avatar = req.session.avatar;
    if(!login){
        res.send("设置头像必须登陆");
        return;
    }
    var form = new formidable.IncomingForm();
    form.uploadDir = path.normalize(__dirname + "/../upload/");
    form.parse(req, function(err, fields,files) {
        var oldpath = files.tupian.path;
        var newpath = path.normalize(__dirname + "/../upload/") + username +"." + files.tupian.type.split("\/")[1];

        fs.rename(oldpath,newpath,function(err){
            if(err){
                res.send("上传失败");
                return;
            }
            req.session.upload = username +"." + files.tupian.type.split("\/")[1];
            res.redirect("/cut");
            return;
        });
    });
}

function showCut(req,res,next){
    var login = req.session.login;
    var username = req.session.username;
    var avatar = req.session.avatar;
    var upload = req.session.upload;
    if(!login){
        res.send("设置头像必须登陆");
        return;
    }
    res.render("cut",{
        "login" : login ? true : false,
        "username" : login ? username : "",
        "active" : "登陆",
        "avatar" : login ? avatar : "akari.jpg",
        "upload" : upload
    });
}

function doRegist(req,res,next){
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields) {
        var username = fields.username;
        var password = fields.password;
        password = md5(md5(password) + "lyhcar");
        console.log(username+"  "+password);
        db.find("users",{"username":username},function(err,docs){
            if(err){
                console.log(err);
                res.send("-3");
                return;
            }
            if(docs.length != 0){
                console.log(docs);
                res.send("-1");
                return;
            }
            db.insertOne("users",{
                "username":username,
                "password":password,
                "registDate":new Date(),
                "avatar" : "default.png"
            },function(err,result){
                if(err){
                    console.log(err);
                    res.send("-3");
                    return;
                }
                req.session.login = true;
                req.session.username = username;
                req.session.avatar = "default.png";
                res.send("1");

            });
        });
    });
}

function doLogin(req,res,next){
    console.log("登陆");
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields) {
        var username = fields.username;
        var password = fields.password;

        password = md5(md5(password) + "lyhcar");
        console.log(username+"  "+password);
        db.find("users",{"username":username},function(err,docs){
            if(err){
                console.log(err);
                res.send("-3");
                return;
            }
            if(docs.length == 0){
                console.log(docs);
                res.send("-1");
                return;
            }
            if(password == docs[0].password){
                req.session.login = true;
                req.session.username = username;
                req.session.avatar = docs[0].avatar || "default.png";
                res.send("1");
                db.updateMany("users",{"username":username},{"lastLoginDate":new Date()},function(err,result){
                    if(err){
                        console.log(err);
                    }
                    //console.log(result);
                });
                return;
            }else{
                res.send("-2");
                return;
            }
        });
    });
}

function doCut(req,res,next) {
    var w = req.query.w;
    var h = req.query.h;
    var x = req.query.x;
    var y = req.query.y;
    var upload = req.session.upload;
    var login = req.session.login;
    var username = req.session.username;
    var avatar = req.session.avatar = upload;
    if(!login){
        res.send("设置头像必须登陆");
        return;
    }
    gm("./upload/" + upload)
        .crop(w,h,x,y)
        .resize(100,100,"!")
        .write("./avatar/" + upload,function(err){
            if(err){
                console.log(err);
                res.send("-1");
                return;
            }
            db.updateMany("users",{"username":username},{"avatar": avatar},function(err,result){
                if(err){
                    console.log(err);
                    res.send("-1");
                    return;
                }
                res.send("1");
            });

        })
}

function doPost(req,res,next) {
    var login = req.session.login;
    var username = req.session.username;
    var avatar = req.session.avatar;
    if(!login){
        res.send("设置头像必须登陆");
        return;
    }
    var form = new formidable.IncomingForm();

    form.parse(req, function(err, fields) {
        var content = fields.content;
        db.insertOne("post",{
            content:content,
            username:username,
            datetime:new Date()
        },function(err,result){
            if(err){
                console.log(err);
                res.send("-2");
                return;
            }
            res.send("1");
            return;
        });
    })
};

function getAllShuoshuo(req,res,next) {
    var page = req.query.page;
    db.find("post",{},{"pagesize":2,"page":page,"sort":{"datetime":-1}},function(err,result){
        if (err) {
            console.log(err);
            return;
        }
        //console.log(result);
        res.json(result);
    })
}
function getUserInfo(req,res,next) {
    var username = req.query.username;
    db.find("users",{"username":username},function(err,result){
        if (err) {
            console.log(err);
            return;
        }
        var userinfo = {};
        if(result.length > 0){
            userinfo = {
                "_id":result[0]._id,
                "username":result[0].username,
                "registDate":result[0].registDate,
                "lastLoginDate":result[0].lastLoginDate,
                "avatar":result[0].avatar
            };
        }
        res.json(userinfo);
    })
}