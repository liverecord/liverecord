const models = require('../schema');
const errorHandler = require('./errors');

const Defaults = [
  {name: 'siteName', value: 'LiveRecord', front: true},
  {name: 'siteSlogan', value: 'LiveRecord', front: true},
];

function configure(frontLiveRecordConfig) {

  Defaults.forEach(function(item, index) {
    models.Parameters
    .findOne({name: item.name})
    .then((doc) => {
      if (doc) {
        frontLiveRecordConfig[item.name] = doc.value;
      } else {
        frontLiveRecordConfig[item.name] = item.value;
        let param = new models.Parameters({
          name: item.name,
          value: item.value
        });
        param.save();
      }
    })
    .catch(errorHandler);
  });
}
module.exports.configure = configure;
