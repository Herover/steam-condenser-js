"use strict";

var http = require("http"),
    xmldoc = require('xmldoc');

module.exports = class XMLData {
  getData(url) {
    return new Promise((resolve, reject) => {
      var req = http.get(url (res) => {
        if(res.statusCode !== 200) {
          reject(new Error(`Failed to retrieve XML data because of an HTTP error: ${res.statusMessage} (status code: ${res.statusCode})`));
        }
        else {
          var doc = new xmldoc.XmlDocument();
          resolve(doc);
        }
      }).on("error", (err) => {
        reject(err);
      });
    });
  }
}
