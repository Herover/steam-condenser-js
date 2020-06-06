"use strict";

import http from "http";
import xmldoc from "xmldoc";

module.exports = class XMLData {
  getData(url: string) {
    return new Promise((resolve, reject) => {
      http.get(url, (res) => {
        if(res.statusCode !== 200) {
          reject(new Error(`Failed to retrieve XML data because of an HTTP error: ${res.statusMessage} (status code: ${res.statusCode})`));
        }
        else {
          const doc = new xmldoc.XmlDocument(res.read());
          resolve(doc);
        }
      }).on("error", (err) => {
        reject(err);
      });
    });
  }
}
