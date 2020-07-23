<div align="center">
  <a href="https://superchargejs.com">
    <img width="471" style="max-width:100%;" src="https://superchargejs.com/images/supercharge-text.svg" />
  </a>
  <br/>
  <br/>
  <p>
    <h3>hapi in Google Cloud Functions</h3>
  </p>
  <p>
    Run your hapi server in a Google Cloud function.
  </p>
  <br/>
  <p>
    <a href="#installation"><strong>Installation</strong></a> ·
    <a href="#usage"><strong>Usage</strong></a>
  </p>
  <br/>
  <br/>
  <p>
    <a href="https://www.npmjs.com/package/@supercharge/hapi-google-cloud-functions"><img src="https://img.shields.io/npm/v/@supercharge/hapi-google-cloud-functions.svg" alt="Latest Version"></a>
  </p>
  <p>
    <em>Follow <a href="http://twitter.com/marcuspoehls">@marcuspoehls</a> and <a href="http://twitter.com/superchargejs">@superchargejs</a> for updates!</em>
  </p>
</div>

---

## Introduction
Serverless is becoming popular and widely accepted in the developer community. Going serverless requires a mindset shift. Going serverless requires you to think stateless.

This `@supercharge/hapi-google-cloud-functions` package let’s you use your [hapi.js](https://hapi.dev) HTTP server in a Google Cloud function.

This package wraps your hapi server and transforms an incoming request to the cloud function into a hapi-compatible request. This request will be injected into your hapi server and the resulting response transformed *back* into a cloud-function-compatible format.

It’s basically a “done for you” package to run your hapi server in a serverless function on Google Cloud.


## Requirements
> **hapi v19 (or later)** and **Node.js v12 (or newer)**

This plugin requires **hapi v19** (or later) and **Node.js v12 or newer**.


### Compatibility
| Major Release | [hapi.js](https://github.com/hapijs/hapi) version | Node.js version |
| --- | --- | --- |
| `v2` | `>=19 @hapi/hapi` | `>=12` |
| `v1` | `>=18 hapi` | `>=8` |


## Installation

```
npm i @supercharge/hapi-google-cloud-functions
```


## Usage
Using `@supercharge/hapi-google-cloud-functions` is pretty straightforward:

```js
'use strict'

const Hapi = require('@hapi/hapi')
const CloudFunctionHandler = require('@supercharge/hapi-google-cloud-functions')

// this `handler` will be used as a cached instance
// a warm function will reuse the handler for incoming requests
let handler

module.exports.http = async (request, response) => {
  if (!handler) {
     // First, compose your hapi server with all the plugins and dependencies
    server = new Hapi.Server()

    await server.register({
      plugin: require('@hapi/vision')
    })

    // Second, create a handler instance for your server which will
    // transform the Cloud function request into a hapi-compatible
    // request. Then, send the request through your hapi server
    // and transform the response from hapi into a
    // function-compatible response
    handler = CloudFunctionHandler.for(server)
  }

  return handler.proxy(request, response)
}
```


## Deployment Example
There’s a deployment example in the [supercharge/playground-google-cloud-functions](https://github.com/supercharge/playground-google-cloud-functions) repository.

We used the [Serverless](https://serverless.com/cli/) framework to deploy a Supercharge app in the `playground-google-cloud-functions` repository. The Serverless CLI is sweet because it allows you to deploy your app from a single configuration file.


### 1. Install the `serverless-google-cloudfunctions` Package
When deploying with the Serverless CLI, you need to add the [`serverless-google-cloudfunctions`](https://github.com/serverless/serverless-google-cloudfunctions) package as a dependency to your project. Install it from NPM:

```bash
npm i serverless-google-cloudfunctions
```

Then, you must add it as a plugin to your `serverless.yml` file. The next step describes this file in more detail.


### 2. Deploy to a Google Cloud Function
Deploying to Google Cloud from the Serverless CLI needs a keyfile. Follow these steps in the Serverless docs to [set up your Google Cloud credentials and generate a keyfile](https://serverless.com/framework/docs/providers/google/guide/credentials#get-credentials--assign-roles).

Here’s the sample `serverless.yml` used to deploy the app:

```yaml
service: supercharge-gcp-function # do not use the "google" in the name

provider:
  name: google
  runtime: nodejs8
  region: europe-west1
  project: your-gcp-project-name
  credentials: ./path/to/your/gcp-keyfile.json

functions:
  app:
    handler: http
    memorySize: 256 # default is 1024 MB
    events:
      - http: path

plugins:
  - serverless-google-cloudfunctions
```


### 3. Deploy
Deploy your project to Google Cloud using the Serverless CLI. Run the following command from your project directory:

```bash
sls deploy
```

The deployment process may take some minutes. When finished, you’ll see a URL to access the deployed function. Enjoy!


## Contributing
Do you miss a string function? We very much appreciate your contribution! Please send in a pull request 😊

1.  Create a fork
2.  Create your feature branch: `git checkout -b my-feature`
3.  Commit your changes: `git commit -am 'Add some feature'`
4.  Push to the branch: `git push origin my-new-feature`
5.  Submit a pull request 🚀


## License
MIT © [Supercharge](https://superchargejs.com)

---

> [superchargejs.com](https://superchargejs.com) &nbsp;&middot;&nbsp;
> GitHub [@superchargejs](https://github.com/supercharge/) &nbsp;&middot;&nbsp;
> Twitter [@superchargejs](https://twitter.com/superchargejs)
