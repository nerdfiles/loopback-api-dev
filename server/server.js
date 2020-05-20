// Copyright IBM Corp. 2016,2019. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const loopback = require('loopback');
const boot = require('loopback-boot');

const app = module.exports = loopback();

app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    const baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      const explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});

//console.log(Object.keys(app.models))

app.models.user.find((err, result) => {
  if (result && result.length === 0 ) {
    const user = {
      email: "admin@example.com",
      password: "1234",
      created_at: new Date(),
      username: "admin"
    }

    app.models.user.create(user, (err, result) => {
      console.log('created admin');
      console.log({result});
    })
  }
});

app.models.user.afterRemote('create', async (ctx, user, next) => {

  console.log('created user')
  console.log({user});

  app.models.Profile.create({
    first_name: 'user.username',
    name: user.username,
    created_at: new Date(),
    userId: user.id,
    role: 'editor'
  }, (err, result) => {
    if (!err && result) {
      console.log('created profile')
      console.log({ result});

      app.models.Role.findOrCreate({
        name: "editor"
      }, (err, roleFound) => {
        if (!err && roleFound) {

          console.log('found or created role for editor')
          console.log({roleFound});

          roleFound.principals.create({
            principalType: app.models.RoleMapping.USER,
            principalId: user.id
          }, (errPrincipal, principal) => {
            console.log("created principal for editor")
            console.log({principal})
          });

        }
      });

    } else {
      console.log(err);
    }
  });

});


app.models.Role.find({
  where: {name: "admin"}
}, (err, role) => {
  if (!err && role) {

    console.log({role});

    if (role.length === 0) {
      app.models.Role.create({
        name: "admin",

      }, (roleError, result) => {

        if (!roleError && result) {

          app.models.user.findOne({where: {username: 'admin'}}, (userError, user) => {
            if (!userError && user) {
              console.log('first user found', user)

              result.principals.create({
                principalType: app.models.RoleMapping.USER,
                principalId: user.id
              }, (errPrincipal, principal) => {
                console.log("created principal")
                console.log({principal})
              });

            }
          });
        }

      });
    }
  }
});

app.models.Role.find({where: {name:"editor"}}, (roleErr, roles) => {
  if (!roleErr && roles) {
    if (roles.length === 0) {
      app.models.Role.create({
        name: 'editor'
      }, (creationErr, resultRole) => {
        console.log('created editor role')
        console.log({resultRole})
      })
    }
  }

});

