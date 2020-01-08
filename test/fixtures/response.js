'use strict'

class Response {
  status (status) {
    this.status = status

    return this
  }

  set (headers) {
    this.headers = headers

    return this
  }

  end (payload) {
    this.body = payload

    return this
  }
}

module.exports = Response
