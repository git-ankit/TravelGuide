import React from "react";
import { StyleSheet, View, Image, TouchableOpacity, Text } from "react-native";
import firebase from "react-native-firebase";
import { Button, Headline, TextInput } from "react-native-paper";

const MumbaiActive = require("../../../src/Mumbai/Active.png");
const AhmedabadActive = require("../../../src/Ahmedabad/Active.jpg");
const MumbaiNotActive = require("../../../src/Mumbai/NotActive.png");
const AhmedabadNotActive = require("../../../src/Ahmedabad/NotActive.jpg");

let Mumbai = MumbaiNotActive;
let Ahmedabad = AhmedabadNotActive;
let CityTextColor = "black";

export default class RegisterInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentUser: null,
      loading: true,
      FullName: "",
      City: "null"
    };
    this.ref = firebase.firestore().collection("Users");
  }

  componentDidMount() {
    const { currentUser } = firebase.auth();
    this.setState({ currentUser });
  }

  signOutUser = async () => {
    try {
      await firebase.auth().signOut();
    } catch (e) {
      console.log(e);
    }
  };

  addData = () => {
    this.setState({
      FullName: this.state.FullName,
      City: this.state.City,
      loading: false
    });
    this.ref
      .add({
        FullName: this.state.FullName,
        City: this.state.City,
        email: this.state.currentUser.email
      })
      .then(this.navigateTo());
  };

  navigateTo = () => {
    this.props.navigation.navigate("FetchLocation");
  };

  selectMumbai() {
    this.setState({
      City: "Mumbai"
    });
  }

  selectAhmedabad() {
    this.setState({
      City: "Ahmedabad"
    });
  }

  selectOther() {
    this.setState({
      City: "Other"
    });
  }

  render() {
    const { currentUser } = this.state;
    Mumbai = this.state.City == "Mumbai" ? MumbaiActive : MumbaiNotActive;
    Ahmedabad =
      this.state.City == "Ahmedabad" ? AhmedabadActive : AhmedabadNotActive;
    CityTextColor = this.state.City == "Other" ? "green" : "black";
    return (
      <View style={styles.container}>
        <View style={styles.textInp}>
          <Headline
            style={{
              textAlign: "center",
              fontWeight: "bold"
            }}
          >
            Let's complete the Last step!{" "}
          </Headline>
          <TextInput
            style={{ backgroundColor: "white" }}
            mode="flat"
            autoCapitalize="none"
            label="Full Name"
            onChangeText={FullName => this.setState({ FullName })}
            value={this.state.FullName}
          />
        </View>
        <View style={styles.imgFlex}>
          <View style={{ width: "45%" }}>
            <TouchableOpacity onPress={() => this.selectMumbai()}>
              <Image
                style={{
                  justifyContent: "center",
                  width: "90%",
                  height: "100%"
                }}
                resizeMode="center"
                source={Mumbai}
              />
            </TouchableOpacity>
          </View>
          <View style={{ width: "45%" }}>
            <TouchableOpacity onPress={() => this.selectAhmedabad()}>
              <Image
                style={{
                  justifyContent: "center",
                  width: "90%",
                  height: "100%"
                }}
                resizeMode="center"
                source={Ahmedabad}
              />
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ justifyContent: "center" }}>
          <TouchableOpacity onPress={() => this.selectOther()}>
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
                color: CityTextColor
              }}
            >
              MY CITY IS NOT LISTED :(
            </Text>
          </TouchableOpacity>
        </View>
        <View>
          <View style={styles.nextBtn}>
            <Button
              disabled={this.state.FullName.length == 0 || this.City == "null"}
              style={[
                styles.btnstyle,
                {
                  margin: 10,
                  backgroundColor: "#4CAF50"
                }
              ]}
              mode="contained"
              onPress={() => this.addData()}
            >
              Next
            </Button>
            <Button
              style={[
                styles.btnstyle,
                {
                  backgroundColor: "red"
                }
              ]}
              mode="contained"
              onPress={() => this.signOutUser(currentUser)}
            >
              Signout
            </Button>
          </View>
        </View>
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
  textInp: {
    padding: 20,
    justifyContent: "center"
  },
  imgFlex: {
    height: "25%",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row"
  },

  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  }
});
