import React, { useEffect, useState } from "react";
// Needed to polyfill ECMAScript features
import "core-js/stable";
// Need to use transpiled generator functions
import "regenerator-runtime/runtime";
import { Switch, Route } from "react-router-dom";

import Nav from "./Nav";
import PrivateRoute from "./base/PrivateRoute";
import { connect } from "react-redux";
import { refreshAccess } from "./../services/userServices";
import { logIn } from "./../redux/actions/account";
// Web pages
import LandingPage from "./pages/LandingPage";
import RegisterPage from "./pages/RegisterPage";
import AccountPage from "./pages/AccountPage";
import LoginPage from "./pages/LoginPage";

import "./../styles/css/style.css";

function Website(props) {
  // function setRefresh(data) {
  //   setTimeout(() => {
  //     login(, setRefreshLogin);
  //   }, 1000 * config.ACCESS_AUTH_EXP);
  // }

  useEffect(() => {
    // When the user visits the website, check if there is an access token.
    if (!props.loggedIn) {
      // If there is no access token, check if there is a refresh token.
      //
      // NOTE: User should not be directed to log in in case if refresh access
      // fails. The user should only be redirected to login when the user attempts
      // to access a protected route.

      // TODO: detect if there is refresh token. if there is, then send refresh
      // to get access token
      if (typeof document !== "undefined") {
        console.log(`Cookies: ${document.cookie}`);
        // TODO: is this the correct way to get cookies?
        if (document.cookie.refresh)
          refreshAccess((result) => {
            console.log("Successful login!");
            console.log("Result: ", result);
            logIn(result);
            // TODO: timer for refresh
          });
      }
    }

    // TODO: set browser fingerprint in redux
  }, []);

  const [showModal, setShowModal] = useState(true);

  return (
    <>
      {showModal && (
        <div>
          <p>Please note that website is still under construction. </p>
          <button onClick={() => setShowModal(false)}>OK</button>
        </div>
      )}
      {/* <Nav /> */}
      <Switch>
        <Route path="/" exact component={LandingPage} />
        <Route path="/register" component={RegisterPage} />
        <Route path="/login" component={LoginPage} />
        <PrivateRoute path="/account" component={AccountPage} />
      </Switch>
    </>
  );
}

const mapStateToProps = (state) => {
  const loggedIn = state.account.token != "";
  return { loggedIn };
};

export default connect(mapStateToProps)(Website);
