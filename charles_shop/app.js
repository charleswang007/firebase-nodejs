var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const favicon = require('serve-favicon');
var minifyHTML = require('express-minify-html');
var session = require('express-session');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var memberRouter = require('./routes/member');
var auth = require('./middleware/auth');

var app = express();

app.use(minifyHTML({
  override:      true,
  exception_url: false,
  htmlMinifier: {
      removeComments:            true,
      collapseWhitespace:        true,
      collapseBooleanAttributes: true,
      removeAttributeQuotes:     true,
      removeEmptyAttributes:     true,
      minifyJS:                  true
  }
}));

//firebase-admin
var admin = require("firebase-admin");
var serviceAccount = require("./serviceAccountKey.json");
const firebase = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const database = firebase.firestore();
const FirestoreStore = require("firestore-store")(session);

app.use(session({
  store: new FirestoreStore({
    database,
  }),
  secret: 'charles007_shop', //輸入自己的名稱
  resave: true, //重複儲存 session
  saveUninitialized: false,//避免一開始就建立使用者 session (可以節省空間)
  cookie: {
    httpOnly: false
  },
}))

global.admin = admin; //設定全域引用
global.db = admin.firestore(); //設定全域引用

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(__dirname + '/public/favicon.ico'));

app.use("/*",((req, res, next) => {  //所有請求都會經過
  //處理
  console.log(req.sessionID)
  console.log(req.session.uid,"req.session")
  res.locals.session = req.session; // 將session 保存在 res 給 ejs 使用
  res.locals.session = res.locals.session || {}; //防止都沒資料
  console.log("in app.js")
  next()
}));

app.use(['/account','/favorites','/personal','/settings'], auth);

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/member', memberRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.render('404',{ title: '找不到網頁' });
  //next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;