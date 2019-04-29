import React, { Component } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  ActivityIndicator
} from "react-native";
import { Appbar } from "react-native-paper";
import FullWidthImage from "../CustomLibrary/FullWidthImage";
import firebase from "react-native-firebase";
const CommentsEmpty = require("../../src/images/comments_empty.png");
export default class FavUser extends Component {
  constructor(props) {
    super(props);
    this.user_email = this.props.navigation.getParam("user", null); // the current user email
    this.following = this.props.navigation.getParam("following", null); // the current user email
    this.state = {
      loading: true
    };
    this.user = firebase.firestore().collection("Users");
    this.getNameByEmail(this.user_email);
  }

  getNameByEmail = async email => {
    Name = [];
    await this.user
      .where("email", "==", email)
      .get()
      .then(
        (info = query => {
          query.forEach(doc => {
            Name = doc.data().FullName;
          });
        })
      );
    return Name;
  };

  componentDidMount = async () => {
    user = [];
    following = this.following;
    for (i = 0; i < following.length; i++) {
      user.push({
        name: await this.getNameByEmail(following[i]),
        email: following[i]
      });
      // console.log(userName);
    }
    this.setState({ loading: false, user });
  };

  _renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate("ProfileScreen2", {
          user: item.email,
          userID: item.email
        });
      }}
    >
      <View
        elevation={1}
        style={{
          backgroundColor: "#fff",
          marginLeft: 10,
          marginRight: 10,
          marginBottom: 5,
          marginTop: 5,
          borderRadius: 5,
          padding: 10,
          shadowOffset: { width: 10, height: 10 },
          shadowColor: "black",
          shadowOpacity: 1.0,
          justifyContent: "center"
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ width: "60%" }}>
            <Text style={{ fontWeight: "bold", fontSize: 20 }}>
              {item.name}
            </Text>
          </View>
          <Text>{item.email}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  _keyExtractor = (item, index) => item.email;

  render() {
    if (this.state.loading) {
      ListView = (
        <View
          style={{ justifyContent: "center", alignItems: "center", flex: 1 }}
        >
          <ActivityIndicator size="large" />
        </View>
      );
    } else
      ListView = (
        <FlatList
          data={this.state.user}
          keyExtractor={this._keyExtractor}
          renderItem={this._renderItem}
        />
      );

    return (
      <View style={styles.container}>
        <Appbar.Header style={{ backgroundColor: "#009688" }}>
          <Appbar.Action
            icon="arrow-back"
            color="white"
            onPress={() => this.props.navigation.goBack()}
          />
          <Appbar.Content title="Favourites" color="white" />
        </Appbar.Header>
        {ListView}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  LineBorder: {
    height: 4
  },
  container: {
    flex: 1,
    backgroundColor: "#fff"
  }
});
