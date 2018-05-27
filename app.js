const express = require("express");
const app = express();

const session = require("express-session");

const router = require("./router/router");


app.set('trust proxy', 1) // trust first proxy
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    //cookie: { secure: true }
}));

app.set("view engine","ejs");

app.use(express.static("./public"));
app.use("/upload",express.static("./upload"));
app.use("/avatar",express.static("./avatar"));

app.get("/",router.showIndex);
app.get("/regist",router.showRegist);
app.post("/doregist",router.doRegist);
app.get("/login",router.showLogin);
app.post("/dologin",router.doLogin);
app.get("/logout",router.showLogout);
app.get("/setdetail",router.showSetdetail);
app.post("/dosetdetail",router.showDosetdetail);
app.get("/cut",router.showCut);
app.get("/docut",router.doCut);
app.post("/post",router.doPost);

app.get("/getallshuoshuo",router.getAllShuoshuo);
app.get("/getuserinfo",router.getUserInfo);

app.listen(3000);
