// ----------------------------------------------------------------------------

'use strict'

// npm
const aws = require('aws-sdk')

// local
const env = require('./env.js')

// ----------------------------------------------------------------------------

console.log(env)

// setup
const spacesEndpoint = new aws.Endpoint(`${env.doSpaceRegion}.digitaloceanspaces.com`)
const space = new aws.S3({
  endpoint: spacesEndpoint,
  accessKeyId: env.doAccessKeyId,
  secretAccessKey: env.doSecretAccessKey,
})

function upload(id, text, callback) {
  const params = {
    Bucket: env.doSpaceName,
    Key: id,
    Body: text,
  }
  const options = {
    partSize: 10 * 1024 * 1024, // 10 MB
    queueSize: 10,
  }
  space.upload(params, options, callback)
}

function download(key, callback) {
  const params = {
    Bucket: env.doSpaceName,
    Key: key,
  }

  console.log('Getting:', params)
  space.getObject(params, (err, data) => {
    if (err) {
      if (err.code === 'NoSuchKey' && err.statusCode === 404) {
        // not found
        callback()
        return
      }
      // something went really wrong
      callback(err)
      return
    }

    console.log(data)
    callback(null, String(data.Body))
    /*
      data = {
        AcceptRanges: "bytes",
        ContentLength: 3191,
        ContentType: "image/jpeg",
        ETag: "\"6805f2cfc46c0f04559748bb039d69ae\"",
        LastModified: <Date Representation>,
        Metadata: {},
        TagCount: 2,
        VersionId: "null"
      }
    */
  })
}

// ----------------------------------------------------------------------------

module.exports = {
  space,
  upload,
  download,
}

// ----------------------------------------------------------------------------
