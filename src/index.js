const Hapi = require('hapi')
const MongoDB = require('hapi-mongodb')
const Boom = require('boom')
const Joi = require('joi')
const DBConfig = require('./config/db-config')
const Request = require('request')
const Cheerio = require('cheerio')

const server = new Hapi.Server()
server.connection({ port: 3333 })

server.route([{
  method: 'GET',
  path: '/offers',
  config: {
    handler: (request, reply) => {
      const db = request.server.plugins['hapi-mongodb'].db
      reply(db.collection('offers').find({}).toArray())
    },
    cors: true
  }
}, {
  method: 'POST',
  path: '/offers/check',
  config: {
    handler: (request, reply) => {
      const db = request.server.plugins['hapi-mongodb'].db
      const doc = {
        url: request.payload.url
      }
      db.collection('offers').findOne(doc, (err, result) => {
        if (err) {
          return reply(Boom.internal('Internal MongoDB error', err))
        }
        if (result) {
          return reply(result)
        } else {
          Request(doc, (err, response, body) => {
            if (err) {
              return reply(Boom.internal('Internal Request error', err))
            }
            const $ = Cheerio.load(body)
            doc.imgUrl = $('.bigImage').first().attr('src')
            doc.comments = []

            db.collection('offers').insertOne(doc, (err, result) => {
              if (err) {
                return reply(Boom.internal('Internal MongoDB error', err))
              }
              return reply({
                url: request.payload.url,
                imgUrl: doc.imgUrl,
                comments: [],
                _id: result.insertedId
              })
            })
          })
        }
      })
    },
    validate: {
      payload: {
        url: Joi.string().required()
      }
    },
    cors: true
  }
}, {
  method: 'POST',
  path: '/offers',
  config: {
    handler: (request, reply) => {
      const db = request.server.plugins['hapi-mongodb'].db
      const dbDoc = {
        url: request.payload.url
      }
      db.collection('offers').updateOne({ url: request.payload.url }, dbDoc, { upsert: true }, (err, result) => {
        if (err) {
          return reply(Boom.internal('Internal MongoDB error', err))
        }
        return reply(result)
      })
    },
    validate: {
      payload: {
        url: Joi.string().required()
      }
    },
    cors: true
  }
}, {
  method: 'POST',
  path: '/offers/{id}/comments',
  config: {
    handler: (request, reply) => {
      const db = request.server.plugins['hapi-mongodb'].db
      const ObjectID = request.server.plugins['hapi-mongodb'].ObjectID
      const dbDoc = {
        author: request.payload.author,
        body: request.payload.body,
        date: request.payload.date
      }
      db.collection('offers').updateOne(
        { _id: new ObjectID(request.params.id) },
        { $addToSet: { comments: dbDoc } },
        { upsert: true },
      (err, result) => {
        if (err) {
          return reply(Boom.internal('Internal MongoDB error', err))
        }
        return reply(result)
      })
    },
    validate: {
      payload: {
        author: Joi.string().required(),
        body: Joi.string().required(),
        date: Joi.date().required()
      }
    },
    cors: true
  }
}, {
  method: 'GET',
  path: '/offers/{id}',
  config: {
    handler: (request, reply) => {
      const db = request.server.plugins['hapi-mongodb'].db
      const ObjectID = request.server.plugins['hapi-mongodb'].ObjectID

      db.collection('books').findOne({ _id: new ObjectID(request.params.id) }, (err, result) => {
        if (err) {
          return reply(Boom.internal('Internal MongoDB error', err))
        }
        return reply(result)
      })
    },
    cors: true
  }
}])

server.register({
  register: MongoDB,
  options: DBConfig.opts
}, (err) => {
  if (err) {
    console.error(err)
    throw err
  }

  server.start(() => console.log('Server started at:', server.info.uri))
})
