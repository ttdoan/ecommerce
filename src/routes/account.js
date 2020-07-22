import express from "express";
import React from "react";
import jwt from "./../jwtUtils";
import { renderToString } from "react-dom/server";

import User from "./../models/user";
import sellerRouter from "./seller";
// import SignupPage from "./../client/js/components/SignupPage";

let router = express.Router();

// router.get("/", (req, res) => {
//   console.log("Got into signup");
//   let reactComp = renderToString(<SignupPage />);
//   res.setHeader("Content-Type", "text/html");
//   return res.render("signup", { reactComp: reactComp });
// });

// Register a new user
// NOTE: It's better to use POST command with sensitive info
//       (such as login info) because GET request has sensitive info
//       appended to the URL whereas POST request has sensitive info
//       in the message body, which is more secure.
router.post("/register", (req, res) => {
  let errors = [];
  if (!req.body.user.email) errors.push("Request body.email is required!");
  if (!req.body.user.password)
    errors.push("Request body.password is required!");
  if (errors.length) return res.status(400).json({ errors });

  let user = new User({
    email: req.body.user.email,
    password: req.body.user.password,
  });

  (async () => {
    // Check if user already exists in database
    User.find({ email: user.email }, async (err, result) => {
      if (result.length === 0) {
        user.createHash(user.password);
        await user.save(function (err) {
          if (err) throw err;
          return res.status(201).json({
            message: `Email ${user.email} is registered successfully!`,
          });
        });
      } else
        return res
          .status(400)
          .json({ message: `Email ${user.email} already exists!` });
    });
  })();
});

// Login into account with user credentials
// TODO: add authentication
router.post("/login", (req, res) => {
  let errors = [];
  if (!req.body.user.email) errors.push("Request body.user.email is required!");
  if (!req.body.user.password)
    errors.push("Request body.user.password is required!");
  if (!req.body.browser.fingerprint)
    errors.push("Request body.browser.fingerprint is required!");
  if (errors.length) return res.status(400).json({ errors });

  // Authenticate user
  User.findOne(
    { email: req.body.user.email },
    "salt password",
    (errors, result) => {
      if (errors) return res.status(401).json({ errors });
      // User is not registered in database.
      if (result.length === 0)
        return res
          .status(401)
          .json({ errors: `Cannot find user ${req.body.email} in database!` });
      // Password is not correct.
      console.log("Result: " + result);
      if (
        !User.validatePassword(
          result.password,
          result.salt,
          req.body.user.password
        )
      )
        return res.status(401).json({ error: "Incorrect password!" });

      // Generate access token.
      let accessToken = jwt.getAccessToken({ email: req.body.user.email });
      // Generate refresh token and store token value in database.
      let refreshToken = jwt.getRefreshToken({
        email: req.body.user.email,
        fingerprint: req.body.browser.fingerprint,
      });

      // Set refresh token in HttpOnly cookie.
      res.cookie("refreshToken", refreshToken, {
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
        httpOnly: true,
        sameSite: true,
      });

      return res.status(200).json({
        accessToken,
      });
    }
  );
});

// Modify user password
router.post("/modify", (req, res) => {
  // TODO: add authentication
});

// Delete user account
// TODO: add authentication
router.post("/delete", (req, res) => {
  if (!req.body.user || !req.body.user.email)
    return res
      .status(400)
      .json({ message: "Request doesn't have user email in body!" });

  User.deleteOne({ email: req.body.user.email }, (err, result) => {
    if (err) res.status(400).json({ message: err });
    if (result.deletedCount === 1)
      return res
        .status(200)
        .json({ message: `Successfully deleted user ${req.body.user.email}!` });
    else
      return res.status(400).json({
        message: `User ${req.body.user.email} was not found in database!`,
      });
  });
});

// Subroute for seller account
router.use("/seller", sellerRouter);

export default router;