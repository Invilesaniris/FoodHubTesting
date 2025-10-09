const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
var mongoose = require("mongoose");

const Seller = require("../../accesscontrol/models/seller");
const User = require("../../accesscontrol/models//user");
const Account = require("../../accesscontrol/models/account");
const Order = require("../../order/models/order");
const io = require("../../../util/socket");
const app = require("../../../app");

exports.getLoggedInUser = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    const error = new Error("Not authenticated");
    error.statusCode = 401;
    throw error;
  }

  const token = authHeader.split(" ")[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, "supersecretkey-foodWebApp");
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
  if (!decodedToken) {
    const error = new Error("Not authenticated");
    error.statusCode = 401;
    throw error;
  }

  const accountId = decodedToken.accountId;
  let accountObj;
  let sellerObj;

  Account.findById(accountId)
    .then((account) => {
      if (!account) {
        const error = new Error("Internal server error");
        error.statusCode = 500;
        throw error;
      }
      accountObj = account;
      return User.findOne({ account: account._id }).populate({
        path: "account",
        select: ["email", "role"],
      });
    })
    .then((user) => {
      if (user) {
        return user;
      } else {
        return Seller.findOne({ account: accountObj._id })
          .populate("items")
          .populate({ path: "account", select: ["email", "role"] });
      }
    })
    .then((result) => {
      res.json({ result });
    })
    .catch((err) => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};
