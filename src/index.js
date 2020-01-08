'use strict'

const HapiRequest = require('./request')

class HapiInGoogleCloudFunctions {
  constructor (server) {
    this.server = server
  }

  /**
   * Create a new instance wrapping the hapi `server`.
   *
   * @param {Server} server
   *
   * @returns {HapiInGoogleCloudFunctions}
   */
  static for (server) {
    return new this(server)
  }

  /**
   * Transforms an incoming API Gateway event into a hapi request. The request
   * will be injected into the wrapped server and the resulting response
   * transformed into an API-Gateway-compatible format.
   *
   * @param {Object} request - Express.js-compatible request object
   * @param {Object} response - Express.js-compatible response
   *
   * @returns {Response}
   */
  async proxy (request, response) {
    const { statusCode, rawPayload, headers } = await this.sendThroughServer(request)

    return response
      .status(statusCode)
      .set(headers)
      .end(rawPayload)
  }

  /**
   * Create a request using the event’s input and inject
   * it into the hapi server. Returns the hapi response.
   *
   * @param {Object} request
   *
   * @returns {Response}
   */
  async sendThroughServer (request) {
    return this.server.inject(
      this.map(request)
    )
  }

  /**
   * Create a hapi-compatible request using the event’s input.
   *
   * @param {APIGatewayEvent} request
   *
   * @returns {Object}
   */
  map (request) {
    return HapiRequest.createFrom(request)
  }
}

module.exports = HapiInGoogleCloudFunctions
