const express = require("express");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const { doesNotMatch } = require("assert");

let getObject = (req, res) => {
  console.log("Request is", req.params.repo, req.params.oid);
  const oid = req.params.oid;
  fs.readFile(
    `.git/objects/${oid.substring(0, 2)}/${oid.substr(2)}`,
    (err, data) => {
      if (err) {
        console.log(err);
        res.status(404);
        let message = "Not found";
        res.send({ message });
        return;
      }
      console.log(data);
      console.log("Content is-----", data);
      const content = zlib.inflateSync(Buffer.from(data));
      console.log("Content received", content.toString());
      const response = content.toString().split("\0")[1];
      res.status(200).send(response);
    }
  );
};

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
      let message = "File already exists";
      res.status(500).send({ message });
      return;
    }
    zlib.deflate(data, (err, compressedData) => {
      if (!err) {
        let cData = compressedData;
        console.log("zlib data ", cData);

        fs.writeFile(objectLoc, cData, function (err) {
          if (err) {
            console.log(err);
            let message = "Internal server error occured";
            res.status(500).send({ message });
            return;
          }
          console.log("saved");
          let respObj = { oid: `${sha1Code}`, size: `${data}`.length };
          res.status(201).send(respObj);
        });
      } else {
        console.log("Error in zlib compression.");
        let message = "Internal server error occured";
        res.status(500).send({ message });
      }
    });
  });
};

let deleteObject = (req, res) => {
  console.log("Request is", req.params.repo, req.params.oid);
  const repo = req.params.repo;
  const oid = req.params.oid;
  fs.unlink(`.git/objects/${oid.substring(0, 2)}/${oid.substr(2)}`, (err) => {
    let message;
    if (err) {
      message = "Deleted Successfully";
      res.status(404).send({ message });
      return;
    }
    message = "Deleted Successfully";
    res.status(200).send({ message });
  });
};

module.exports = {
  getObject,
  saveObject,
  deleteObject,
};
