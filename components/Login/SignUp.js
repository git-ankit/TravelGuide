import React from "react";
import { StyleSheet, View, Dimensions, Image, Text } from "react-native";
import firebase from "react-native-firebase";
import { TextInput, Button, Snackbar } from "react-native-paper";

const SignUpHeader = require("../../src/Header/SignUpHeader.png");

export default class Login extends React.Component {
  state = {
    email: "",
    password: "",
    rpassword: "",
    errorMessage: null,
    loading: false,
    toast: false,
    viewMode: Dimensions.get("window").height > 500 ? "portrait" : "landscape"
  };

  constructor(props) {
    super(props);
    Dimensions.addEventListener("change", dims => {
      this.setState({
        viewMode:
          Dimensions.get("window").height > 500 ? "portrait" : "landscape"
      });
    });
  }

  handleSignup = () => {
    this.setState({ loading: true });
    const { email, password } = this.state;
    firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then(() => this.props.navigation.navigate("Main"))
      .catch(error =>
        this.setState({
          errorMessage: error.message,
          loading: false,
          toast: true
        })
      );
  };

  componentWillUnmount() {
    Dimensions.removeEventListener("change");
  }

  render() {
    let headerImage = null;

    if (this.state.viewMode === "portrait") {
      headerImage = (
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            height: "40%",
            marginTop: "5%"
          }}
        >
          <Image
            style={{
              width: "100%",
              height: "100%"
            }}
            resizeMode="center"
            source={SignUpHeader}
          />
        </View>
      );
    }
    return (
      <View style={styles.container}>
        {headerImage}
        <View style={styles.textinput}>
          <TextInput
            style={{ backgroundColor: "white" }}
            mode="flat"
            autoCapitalize="none"
            label="Email"
            keyboardType="email-address"
            onChangeText={email => this.setState({ email })}
            value={this.state.email}
          />
          <View
            style={
              this.state.viewMode === "portrait"
                ? styles.portraitPassword
                : styles.landscapePassword
            }
          >
            <View
              style={
                this.state.viewMode === "portrait"
                  ? styles.portraitWrapper
                  : styles.landscapeWrapper
              }
            >
              <TextInput
                style={{ backgroundColor: "white" }}
                mode="flat"
                secureTextEntry
                autoCapitalize="none"
                label="Password"
                onChangeText={password => this.setState({ password })}
                value={this.state.password}
              />
            </View>
            <View
              style={
                this.state.viewMode === "portrait"
                  ? styles.portraitWrapper
                  : styles.landscapeWrapper
              }
            >
              <TextInput
                style={{ backgroundColor: "white" }}
                mode="flat"
                secureTextEntry
                autoCapitalize="none"
                label=" Retype Password"
                onChangeText={rpassword => this.setState({ rpassword })}
                value={this.state.rpassword}
              />
            </View>
          </View>
        </View>
        <View>
          <View style={styles.loginbtns}>
            <Button
              disabled={
                !this.state.email.includes("@") ||
                this.state.password.length === 0 ||
                this.state.password !== this.state.rpassword
              }
              style={[
                styles.btnstyle,
                {
                  margin: 10,
                  backgroundColor: "#4CAF50"
                }
              ]}
              mode="contained"
              loading={this.state.loading}
              onPress={this.handleSignup}
            >
              Sign Up
            </Button>
            <Button
              style={styles.btnstyle}
              mode="contained"
              onPress={() => this.props.navigation.navigate("Login")}
            >
              Login?
            </Button>
          </View>
          <View style={{ justifyContent: "center", alignItems: "center" }}>
            <Text>Sign up with Google</Text>
          </View>
        </View>
        <Snackbar
          visible={this.state.toast}
          onDismiss={() => this.setState({ toast: false })}
        >
          {this.state.errorMessage}
        </Snackbar>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center"
  },
  textinput: {
    margin: "5%",
    justifyContent: "center"
  },
  portraitPassword: {
    flexDirection: "column"
  },
  landscapePassword: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  portraitWrapper: {
    width: "100%"
  },
  landscapeWrapper: {
    width: "48%"
  },
  btnstyle: {
    height: 50,
    width: 150,
    justifyContent: "center"
  },
  loginbtns: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },
  signupbtn: {
    justifyContent: "center",
    alignItems: "center"
  }
});
