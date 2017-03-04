/**
 * Created by zoonman on 12/26/16.
 */
const mongoose = require('mongoose');
const ParameterSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed
  }
});
module.exports = mongoose.model('Parameters', ParameterSchema);
