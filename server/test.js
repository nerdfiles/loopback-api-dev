var models = require('./server.js').models

models.Profile.findOrCreate({name: 'admin'}, (err, profile) => {
  if (!err && profile) {
    console.log({profile});
  }
});

var filter = {
  where: {
    email: {like:'admin'}
  },
  order: 'date ASC',
  limit: 5,
  include: '',
}

models.Profile.findOne(filter, (err, found) =>  {})
