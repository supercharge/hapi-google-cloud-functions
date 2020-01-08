'use strict'

const Querystring = require('querystring')

class Request {
  constructor (request) {
    this.request = request
  }

  /**
   * Create a request instance for the given API Gateway `event`.
   *
   * @param {Object} request
   *
   * @returns {Request}
   */
  static createFrom (request) {
    return new this(request).create()
  }

  /**
   * Returns a hapi-compatible request that
   * can be injected into a hapi server.
   *
   * @returns {Object}
   */
  create () {
    return {
      url: this.url(),
      method: this.method(),
      payload: this.payload(),
      headers: this.headers()
    }
  }

  /**
   * Returns the request’s URL with query parameters if
   * query params are present on the incoming request.
   *
   * @returns {String}
   */
  url () {
    return this.hasQuerystring()
      ? `${this.path()}?${this.query()}`
      : this.path()
  }

  /**
   * Determine whether the incoming request has query parameters.
   *
   * @returns {Boolean}
   */
  hasQuerystring () {
    return !!this.query()
  }

  /**
   * Returns the request’s stringified query parameters.
   *
   * @returns {String}
   */
  query () {
    return Querystring.stringify(
      this.request.query
    )
  }

  /**
   * Returns the request path.
   *
   * @returns {String}
   */
  path () {
    return this.request.path
  }

  /**
   * Returns the HTTP method.
   *
   * @returns {String}
   */
  method () {
    return this.request.method
  }

  /**
   * Returns the request payload.
   *
   * @returns {*}
   */
  payload () {
    return this.request.body
  }

  /**
   * Returns the request headers.
   *
   * @returns {Object}
   */
  headers () {
    return this.request.headers
  }
}

module.exports = Request
