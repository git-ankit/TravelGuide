import React from "react";
import { StyleSheet, View, Dimensions, Image } from "react-native";
import firebase from "react-native-firebase";
import { TextInput, Button, Snackbar } from "react-native-paper";

const PasswordHeader = require("../../src/Header/PasswordHeader.png");

export default class ForgotPassword extends React.Component {
  state = {
    email: "",
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

  onSubmit = () => {
    this.setState({ loading: true });
    const { email } = this.state;
    firebase
      .auth()
      .sendPasswordResetEmail(email)
      .then(() => this.props.navigation.navigate("Login"))
      .catch(error =>
        this.setState(
          { errorMessage: error.message },
          this.setState({ loading: false, toast: true })
        )
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
            source={PasswordHeader}
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
        </View>
        <View>
          <View style={styles.btns}>
            <Button
              disabled={!this.state.email.includes("@")}
              style={[
                styles.btnstyle,
                {
                  margin: 10,
                  backgroundColor: "red",
                  justifyContent: "center"
                }
              ]}
              mode="contained"
              loading={this.state.loading}
              onPress={this.onSubmit}
            >
              Send Password
            </Button>
            <Button
              style={[
                styles.btnstyle,
                {
                  backgroundColor: "#4CAF50",
                  justifyContent: "center"
                }
              ]}
              mode="contained"
              onPress={() => this.props.navigation.navigate("Login")}
            >
              Go Back
            </Button>
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
    marginTop: "5%",
    marginLeft: "5%",
    marginRight: "5%"
  },
  btnstyle: {
    height: 50,
    width: 170,
    justifyContent: "center"
  },
  btns: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  }
});
