'use strict'

const Zlib = require('zlib')
const Hapi = require('@hapi/hapi')
const HapiCloudFunctions = require('..')
const Response = require('./fixtures/response')

const { createServer } = require('../examples/hapi-serverless/server')
const CloudFunctionRequest = require('../examples/hapi-serverless/cloud-function-request.json')

let cloudFunction

function clone (json) {
  return JSON.parse(JSON.stringify(json))
}

function makeRequest (overrides) {
  const baseRequest = clone(CloudFunctionRequest)
  const request = Object.assign({}, baseRequest, overrides)

  return request
}

describe('hapi in Google Cloud Function', () => {
  beforeAll(async () => {
    const server = await createServer(false)
    cloudFunction = HapiCloudFunctions.for(server)
  })

  it('has .proxy() method', async () => {
    expect(cloudFunction.proxy).toBeDefined()
  })

  it('GET rendered HTML', async () => {
    const request = makeRequest({ path: '/', method: 'GET' })

    const response = await cloudFunction.proxy(request, new Response())

    const { status, body } = response
    expect(status).toEqual(200)
    expect(body.toString()).toStartWith('<!DOCTYPE html>')
    expect(body.toString()).toInclude('<h1>Going Serverless with hapi!</h1>')
  })

  it('GET users as JSON', async () => {
    const request = makeRequest({ path: '/users', method: 'GET' })

    const response = await cloudFunction.proxy(request, new Response())

    const { status, body } = response
    expect(status).toEqual(200)
    expect(body.toString()).toEqual(JSON.stringify([
      { id: 1, name: 'Marcus' },
      { id: 2, name: 'Norman' },
      { id: 3, name: 'Christian' }
    ]))
  })

  it('POST JSON user', async () => {
    const request = makeRequest({
      path: '/users/3',
      method: 'PUT',
      body: { name: 'Supercharge' }
    })

    const response = await cloudFunction.proxy(request, new Response())

    const { status, body } = response
    expect(status).toEqual(200)
    expect(body.toString()).toEqual(JSON.stringify({ id: 3, name: 'Supercharge' }))
  })

  it('GET missing route', async () => {
    const request = makeRequest({ path: '/missing', method: 'GET' })
    const response = await cloudFunction.proxy(request, new Response())

    const { status, body, headers } = response
    expect(status).toEqual(404)
    expect(headers).toMatchObject({
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-cache',
      'content-length': 60,
      connection: 'keep-alive'
    })
    expect(body.toString()).toEqual(JSON.stringify({ statusCode: 404, error: 'Not Found', message: 'Not Found' }))
  })

  it('serves images', async () => {
    const request = makeRequest({
      path: '/images/supercharge-logo.svg',
      method: 'GET',
      query: {
        name: 'Marcus'
      }
    })

    const response = await cloudFunction.proxy(request, new Response())

    const { status, body } = response
    expect(status).toEqual(200)
    expect(body.toString()).toBeDefined()
  })

  it('handles querystrings', async () => {
    const request = makeRequest({
      path: '/query',
      method: 'GET',
      query: {
        name: 'Marcus'
      }
    })
    const response = await cloudFunction.proxy(request, new Response())

    const { status, body } = response
    expect(status).toEqual(200)
    expect(body.toString()).toEqual(JSON.stringify({ name: 'Marcus' }))
  })

  it('handles headers', async () => {
    const request = makeRequest({
      path: '/headers',
      method: 'GET',
      headers: {
        'X-API-Key': 'Marcus'
      }
    })
    const response = await cloudFunction.proxy(request, new Response())

    const { status, body } = response
    expect(status).toEqual(200)
    expect(body.toString()).toContain('"x-api-key":"Marcus"')
  })

  it('handles headers with multiple values', async () => {
    const request = makeRequest({
      path: '/headers',
      method: 'GET',
      headers: {
        'X-API-Keys': ['Marcus', 'Marcus-Key2']
      }
    })
    const response = await cloudFunction.proxy(request, new Response())

    const { status, body } = response
    expect(status).toEqual(200)
    expect(body.toString()).toContain('"x-api-keys":["Marcus","Marcus-Key2"]')
  })

  it('content encoding', async () => {
    const server = new Hapi.Server()

    server.route({
      method: 'GET',
      path: '/',
      handler: (_, h) => {
        return h
          .response('encoding-identity')
          .header('content-encoding', 'identity')
      }
    })

    const cloudFunction = HapiCloudFunctions.for(server)

    const request = makeRequest({
      path: '/',
      method: 'GET'
    })
    const response = await cloudFunction.proxy(request, new Response())

    const { status, body } = response
    expect(status).toEqual(200)
    expect(body.toString()).toEqual('encoding-identity')
  })

  it('content encoding gzip', async () => {
    const server = new Hapi.Server()

    server.route({
      method: 'GET',
      path: '/',
      handler: (_, h) => {
        return h
          .response(Zlib.gzipSync('encoding-gzip'))
          .header('content-encoding', 'gzip')
      }
    })

    const cloudFunction = HapiCloudFunctions.for(server)

    const request = makeRequest({
      path: '/',
      method: 'GET'
    })
    const response = await cloudFunction.proxy(request, new Response())

    const { status, body, headers } = response
    expect(status).toEqual(200)
    expect(headers).toMatchObject({ 'content-encoding': 'gzip' })
    expect(
      Zlib.gunzipSync(Buffer.from(body, 'base64')).toString('utf8')
    ).toEqual('encoding-gzip')
  })
})
