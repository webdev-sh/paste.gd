// ----------------------------------------------------------------------------

'use strict'

// core
const path = require('path')

// npm
const express = require('express')
const compress = require('compression')
const favicon = require('serve-favicon')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const zid = require('zid')
const yid = require('yid')
const LogFmtr = require('logfmtr')
const ms = require('ms')
const aws = require('aws-sdk')

// local
const pkg = require('./pkg.js')
const env = require('./env.js')
const log = require('./log.js')
const space = require('./digital-ocean-space.js')

// ----------------------------------------------------------------------------
// setup

const publicDir = path.resolve(path.join(__dirname, '..', 'public'))
const viewsDir = path.resolve(path.join(__dirname, '..', 'views'))

// create the sitemap
const sitemap = [
  env.baseUrl + '/',
]

// create the entire sitemapTxt
const sitemapTxt = sitemap.join('\n') + '\n'

// ----------------------------------------------------------------------------
// application server

const app = express()
app.set('case sensitive routing', true)
app.set('strict routing', true)
app.set('views', viewsDir)
app.set('view engine', 'pug')
app.enable('trust proxy')

app.locals.pkg = pkg
app.locals.env = env.locals
app.locals.title = pkg.title

app.use(compress())
app.use(favicon(publicDir + '/favicon.ico'))

if ( env.isProd ) {
  app.use(express.static(publicDir, { maxAge : ms('1 month') }))
}
else {
  app.use(express.static(publicDir))
}

app.use(morgan(env.isProd ? 'combined' : 'dev'))
app.use(bodyParser.urlencoded({
  extended : false,
  limit    : '3mb',
}))

// ----------------------------------------------------------------------------
// middleware

app.use((req, res, next) => {
  // add a Request ID
  req._rid = yid()

  // create a RequestID and set it on the `req.log`
  req.log = log.withFields({ rid: req._rid })

  next()
})

app.use(LogFmtr.middleware)

app.use((req, res, next) => {
  // set a `X-Made-By` header :)
  res.setHeader('X-Made-By', 'Andrew Chilton - https://chilts.org - @andychilton')

  // From: http://blog.netdna.com/opensource/bootstrapcdn/accept-encoding-its-vary-important/
  res.setHeader('Vary', 'Accept-Encoding')

  next()
})

// ----------------------------------------------------------------------------
// routes

function redirectToHome(req, res) {
  res.redirect('/')
}

app.get(
  '/',
  (req, res) => {
    res.render('index')
  }
)

app.post(
  '/',
  (req, res) => {
    res.locals.paste = 'Hello, World!\n'
    res.render('paste')
  }
)

app.get(
  '/sitemap.txt',
  (req, res) => {
    res.setHeader('Content-Type', 'text/plain')
    res.send(sitemapTxt)
  }
)

app.get(
  '/uptime',
  (req, res) => {
    res.setHeader('Content-Type', 'text/plain')
    res.send('' + parseInt(process.uptime(), 10))
  }
)

app.get(
  '/:name',
  (req, res, next) => {
    console.log('req.params.name=' + req.params.name)
    space.download(req.params.name, (err, text) => {
      if (err) {
        next(err)
        return
      }
      if (!text) {
        res.setHeader('content-type', 'text/plain');
        res.status(404)
        res.send('404 - Not Found.\n')
        return
      }
      console.log('text:', text)
      res.locals.text = text
      next()
    })
  },
  (req, res) => {
    console.log('name=' + req.params.name)
    res.render('paste')
  }
)

// these links were shown as being linked to in Google Webmasters, but are 404's, so redirect to the homepage
app.get('/,', redirectToHome)

// ----------------------------------------------------------------------------
// export the app

module.exports = app

// ----------------------------------------------------------------------------
