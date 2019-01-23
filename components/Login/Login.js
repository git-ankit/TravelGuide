import React from "react";
import { StyleSheet, View, Dimensions, Image, Text } from "react-native";
import firebase from "react-native-firebase";
import { TextInput, Button, Snackbar } from "react-native-paper";

const LoginHeader = require("../../src/Header/LoginHeader.png");

export default class Login extends React.Component {
  constructor(props) {
    super(props);
    Dimensions.addEventListener("change", dims => {
      this.setState({
        viewMode:
          Dimensions.get("window").height > 500 ? "portrait" : "landscape"
      });
    });
    this.state = {
      email: "",
      password: "",
      errorMessage: null,
      loading: false,
      toast: false,
      viewMode: Dimensions.get("window").height > 500 ? "portrait" : "landscape"
    };
  }

  _signIn = () => {
    GoogleSignin.signIn()
      .then(data => {
        // create a new firebase credential with the token
        const credential = firebase.auth.GoogleAuthProvider.credential(
          data.idToken,
          data.accessToken
        );
        // login with credential
        return firebase.auth().signInWithCredential(credential);
      })
      .catch(error => {
        this.setState({
          errorMessage: error.message,
          loading: false,
          toast: true
        });
      });
  };

  handleLogin = () => {
    this.setState({ loading: true });
    const { email, password } = this.state;
    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
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
            source={LoginHeader}
          />
        </View>
      );
    }
    return (
      <View style={styles.container}>
        {headerImage}
        <View
          style={
            this.state.viewMode === "portrait"
              ? styles.portraitTextinput
              : styles.landscapeTextinput
          }
        >
          <View
            style={
              this.state.viewMode === "portrait"
                ? styles.portraitTextWrapper
                : styles.landscapeTextWrapper
            }
          >
            <TextInput
              style={{ backgroundColor: "white" }}
              mode="flat"
              autoCapitalize="none"
              label="Email"
              keyboardType="email-address"
              onChangeText={email => this.setState({ email })}
              value={this.state.email}
            />
          </View>
          <View
            style={
              this.state.viewMode === "portrait"
                ? styles.portraitTextWrapper
                : styles.landscapeTextWrapper
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
        </View>
        <View style={{ height: "50%" }}>
          <View style={styles.loginbtns}>
            <Button
              disabled={
                !this.state.email.includes("@") ||
                this.state.password.length === 0
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
              onPress={this.handleLogin}
            >
              Login
            </Button>
            <Button
              style={[
                styles.btnstyle,
                {
                  backgroundColor: "red"
                }
              ]}
              mode="contained"
              onPress={() => this.props.navigation.navigate("ForgotPassword")}
            >
              Password?
            </Button>
          </View>
          <View style={{ justifyContent: "center", alignItems: "center" }}>
            <Text>Sign in with Google</Text>
          </View>
          <View style={styles.signupbtn}>
            <View style={{ paddingTop: 20 }}>
              <Button
                mode="contained"
                onPress={() => this.props.navigation.navigate("SignUp")}
              >
                Don't have an Account ? Sign Up
              </Button>
            </View>
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
    backgroundColor: "#fff"
  },
  portraitTextinput: {
    marginLeft: "5%",
    marginRight: "5%"
  },
  landscapeTextinput: {
    margin: "5%",
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row"
  },
  portraitTextWrapper: {
    width: "100%"
  },
  landscapeTextWrapper: {
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
