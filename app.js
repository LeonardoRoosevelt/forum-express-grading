const express = require('express')
const exphbs = require('express-handlebars') // 引入 handlebars
const db = require('./models') // 引入資料庫
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const flash = require('connect-flash')
const helpers = require('./_helpers')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const session = require('express-session')
const passport = require('./config/passport')
const app = express()
const port = process.env.PORT || 3000

app.engine('hbs', exphbs({ defaultLayout: 'main', helpers: require('./config/handlebars-helpers'), extname: 'hbs' })) // Handlebars 註冊樣板引擎
app.set('view engine', 'hbs') // 設定使用 Handlebars 做為樣板引擎
app.use(bodyParser.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(express.static('public'))
app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
app.use('/upload', express.static(__dirname + '/upload'))

// 把 req.flash 放到 res.locals 裡面
app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success_messages')
  res.locals.error_messages = req.flash('error_messages')
  res.locals.user = helpers.getUser(req) // 取代 req.user
  next()
})

app.listen(port, () => {
  db.sequelize.sync() //model與資料庫同步
  console.log(`Example app listening on port ${port}!`)
})

require('./routes')(app, passport)
//error handling
app.use((req, res, next) => {
  const err = new Error('頁面不存在')
  err.status = 404
  next(err)
})
app.use((err, req, res, next) => {
  if (err.status !== 404) {
    err.status = 500
  }
  console.log('here')
  res.status(err.status || 500)
  res.render('err', { err })
})

module.exports = app
