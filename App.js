import React, { Component } from "react";
import LoginNavigatorMain from "./components/Navigator/LoginNavigator";
import enableFontPatch from "./components/fontPatch";

export default class App extends Component {
  componentDidMount() {
    enableFontPatch();
  }

  render() {
    return <LoginNavigatorMain />;
  }
}
