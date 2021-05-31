const express = require("express");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const { doesNotMatch } = require("assert");

let getObject = (req, res) => {};

let saveObject = (req, res) => {};

let deleteObject = (req, res) => {};

module.exports = {
  getObject,
  saveObject,
  deleteObject,
};
