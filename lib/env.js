// ----------------------------------------------------------------------------

'use strict'

// local
const pkg = require('./pkg.js')

// ----------------------------------------------------------------------------

if (!process.env.APEX) {
  throw new Error('Provide a APEX env var')
}
if (!process.env.PORT) {
  throw new Error('Provide a PORT env var')
}

const nodeEnv = process.env.NODE_ENV
const isProd = nodeEnv === 'production'
const isDev = !isProd

const apex = process.env.APEX
const port = process.env.PORT
const protocol = isProd ? 'https' : 'http'
const baseUrl = apex === 'localhost' ? `${protocol}://${apex}:${port}` : `${protocol}://${apex}`

const codeHostingApex = process.env.CODE_HOSTING_APEX || 'github.com'
const codeHostingOrg = process.env.CODE_HOSTING_ORG || 'webdev.sh'
const codeHostingRepo = process.env.CODE_HOSTING_REPO || pkg.name
const codeHostingUrl = `https://${codeHostingApex}/${codeHostingOrg}/${codeHostingRepo}`

const googleAnalytics = process.env.GOOGLE_ANALYTICS
const carbonServe = process.env.CARBON_SERVE
const carbonPlacement = process.env.CARBON_PLACEMENT

const env = {
  nodeEnv,
  isDev,
  isProd,
  apex,
  port,
  baseUrl,
  locals: {
    nodeEnv,
    isDev,
    isProd,
    apex,
    baseUrl,
    codeHostingApex,
    codeHostingOrg,
    codeHostingUrl,
    googleAnalytics,
    carbonServe,
    carbonPlacement,
    min: isProd ? '.min' : ''
  }
}

if (isDev) {
  console.log('env:', env)
}

// ----------------------------------------------------------------------------

module.exports = env

// ----------------------------------------------------------------------------
