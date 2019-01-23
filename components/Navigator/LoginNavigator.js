import React, { Component } from "react";

import { createSwitchNavigator, createAppContainer } from "react-navigation";

// import the different screens
import Loading from "../Login/Loading";
import SignUp from "../Login/SignUp";
import LoginBackground from "../Login/LoginBackground";
import Login from "../Login/Login";
import ForgotPassword from "../Login/ForgotPassword";
import Main from "../Login/Main";
import RegisterInfo from "../Login/UserNavigation/RegisterInfo";

export default class LoginNavigatorMain extends React.Component {
  render() {
    return <AppContainer />;
  }
}

// create our app's navigation stack
const LoginNavigator = createSwitchNavigator(
  {
    Loading,
    SignUp,
    LoginBackground,
    Login,
    ForgotPassword,
    Main,
    RegisterInfo
  },
  {
    initialRouteName: "Loading"
  }
);

const AppContainer = createAppContainer(LoginNavigator);
