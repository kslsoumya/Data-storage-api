const express = require("express");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const { doesNotMatch } = require("assert");

let getObject = (req, res) => {};

let saveObject = (req, res) => {
  // request params
  console.log("Request repo", req.params.repo);
  const repo = req.params.repo;
  // request body
  console.log("Request body", req.body);
  const object = JSON.stringify(req.body);
  const dataHeader = `blob ${Buffer.from(object).length}\0`;
  const data = dataHeader + object;
  console.log("Header", dataHeader.length, dataHeader);
  console.log("data is ", data);
  const cryptoHash = crypto.createHash("sha1");
  const sha1Code = cryptoHash.update(data, "utf-8").digest("hex");
  console.log("Generated sha-1 ", sha1Code);
  const objectLoc = `.git/objects/${sha1Code.substr(0, 2)}/${sha1Code.substr(
    2
  )}`;
  console.log("Path of the object", objectLoc);
  fs.mkdir(path.dirname(objectLoc), (err) => {
    if (err) {
      console.log("Already exists");
      let msg = "File already exists";
      res.status(500).send({ msg });
      return;
    }
    zlib.deflate(data, (err, compressedData) => {
      if (!err) {
        let cData = compressedData;
        console.log("zlib data ", cData);

        fs.writeFile(objectLoc, cData, function (err) {
          if (err) {
            console.log(err);
            let msg = "Internal server error occured";
            res.status(500).send({ msg });
            return;
          }
          console.log("saved");
          let respObj = { oid: `${sha1Code}`, size: `${data}`.length };
          res.status(201).send(respObj);
        });
      } else {
        console.log("Error in zlib compression.");
        let msg = "Internal server error occured";
        res.status(500).send({ msg });
      }
    });
  });
};

let deleteObject = (req, res) => {};

module.exports = {
  getObject,
  saveObject,
  deleteObject,
};
