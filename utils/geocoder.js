const nodeGeocoder = require("node-geocoder");

const options = {
  provider: "mapquest",
  httpAdapter: "https",
  apiKey: "GqAtqlggNf6rpYxd2EKLrLFi1Qfmv2yl",
  formatter: null
}

const geocoder = nodeGeocoder(options);

module.exports = geocoder