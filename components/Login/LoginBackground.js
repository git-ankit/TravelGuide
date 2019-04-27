import React from "react";
import { StyleSheet, View, Image, TouchableOpacity, Text } from "react-native";
import { Button, Headline } from "react-native-paper";

const LoginBackgroundImage = require("../../src/LoginBG.png");

export default class LoginBackground extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.headline}>
          <Headline style={styles.headlinetxt}>Travel Guide</Headline>
        </View>
        <View style={styles.queueimg}>
          <Image
            style={{
              justifyContent: "center"
            }}
            resizeMode="center"
            source={LoginBackgroundImage}
          />
        </View>
        <View style={styles.bottom}>
          <Button
            style={[
              styles.btnstyle,
              {
                margin: 10,
                backgroundColor: "#4CAF50"
              }
            ]}
            mode="contained"
            onPress={() => this.props.navigation.navigate("LoginScreen")}
          >
            Login
          </Button>
          <Button
            style={[styles.btnstyle, { marginTop: 10 }]}
            mode="contained"
            onPress={() => this.props.navigation.navigate("SignUpScreen")}
          >
            Signup
          </Button>
        </View>
        <View>
          <TouchableOpacity
            style={{
              backgroundColor: "black",
              padding: 20,
              borderRadius: 5
            }}
            onPress={() =>
              this.props.navigation.navigate("AppNavigatorNoScreen")
            }
          >
            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 15 }}>
              CONTINUE WITHOUT LOGIN
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  headline: {
    height: "15%",
    alignItems: "center"
  },
  headlinetxt: {
    paddingTop: "10%",
    textAlign: "center",
    fontWeight: "bold",
    width: "100%"
  },
  queueimg: {
    height: "45%",
    justifyContent: "center",
    alignItems: "center"
  },
  bottom: {
    marginTop: 10,
    height: "20%",
    flexDirection: "row"
  },
  btnstyle: {
    height: "35%",
    width: "40%",
    justifyContent: "center"
  }
});
