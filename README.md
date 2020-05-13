Linkedevents-UI - form-style UI for Linked Events API
=====================================================

[![Build status](https://travis-ci.org/City-of-Helsinki/linkedevents-ui.svg?branch=master)](https://travis-ci.org/City-of-Helsinki/linkedevents-ui)
[![codecov](https://codecov.io/gh/City-of-Helsinki/linkedevents-ui/branch/master/graph/badge.svg)](https://codecov.io/gh/City-of-Helsinki/linkedevents-ui)

Linkedevents-UI is a user interface for creating and changing events through
Linked Events API. It exposes many capabilities of the API including:

* Creation, changing and deletion of events
* Managing multipart events
* Showing available actions based on user permissions

# Prerequisites
* Yarn
* Node v8 LTS 
* Python 2 (due to node-sass using node-gyp)

# Development Installation

## Configuration

Copy the contents of `config_dev.json.example` to `config_dev.json`.

`config_dev.json` contains partially working settings giving you read only
access to our test API. If you have your own API and/or authentication
credentials you can change the relevant settings therein.

The UI is now compatible with the `courses` extension for the Linked Events API.
If you wish to include the extra fields specified in the `courses` extension,
please change the `ui_mode` setting from `events` to `courses`.

Note that authentication server is not nicely configurable. If you wish to
use your own authentication server, you will need code changes in server/auth.js.

## Running development server

```
$ yarn
$ yarn start
```

Then point your browser to the webpack dev server at http://localhost:8080/.

# Production installation

## Configuration

For production builds, all configuration is done using environment
variables. This way, no errant configuration files should cause mysterious
build failures or, worse, dormant configuration errors. The environment variables
are named exactly the same as the ones in `config_dev.json`. For example,
if you'd like to change the base address for Linkedevents API, you would:
```
export api_base="https://api.hel.fi/linkedevents/v1"
```

Note that the configuration is used in the different phases. Some settings
need to be defined during build and other settings for running the
authentication server (see below)

Most if not all build automation tools provide for setting environment
variables. Check the documentation for the one you are using. If you are
testing locally you can `source config_build_example.sh` to get started.

### Building

After setting the config you can build install dependencies and build the
static files:
```
$ yarn
$ yarn build
```

You should now have the bundled javascript + some non-bundled assets in
`dist`. You can serve these using your favorite web server at whatever
address suits your fancy.

You will still need the source tree for the authentication server (below)

### Setting up the runtime

In addition to serving the files built in previous step, you will need to
run the built-in authentication server (or proxy really).  Although
linkedevents-ui runs completely in client, it currently uses authentication
code based OAuth2 Authorization Code flow. This is a historical accident,
that will be remedied one day.

We recommend running the authentication server with some sort of process
manager, possibly one specialized in running Node applications. Your system
process manager, like systemd, is another good candidate

The authentication server will need configuration passed in through
environment variables (see Congiration).  If you use a process manager to
run the server, it should provide for setting them.

The server is run by executing `npm run production`. If your process
manager wants to run node by itself, you can also run specify `server` as
the script (that will actually run server/index.js). In this case you will
also need to set environment variable `NODE_ENV=production` by yourself.

After you have the authentication server running, you will need to set up a
web server to serve the files in `dist` and forward authentication requests
to the authentication server. The table below shows what needs to served:
| URL | what is served |
| /auth | forward to authentication server |
| filename | serve from dist-directory |
| unknown files | serve index.html from dist-directory |

The last part is needed for deep linking into the application. 