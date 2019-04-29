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
const ImageEmpty = require("../../src/images/no_image.png");
export default class Profile extends Component {
  constructor(props) {
    super(props);
    this.user_email = this.props.navigation.getParam("user", null); // the current user email
    this.state = {
      pictures: [],
      PicturesLoading: true,
      user: ""
    };

    this.userDoc = this.props.navigation.getParam("userID");
    this.followDoc = firebase
      .firestore()
      .collection("Users")
      .doc(this.userDoc);
    this.user = firebase.firestore().collection("Users");
    this.getNameByEmail(this.user_email);
    this.ref = firebase
      .firestore()
      .collection("Questions")
      .where("asked_by", "==", this.user_email);
    this.ref.onSnapshot(this.onCollectionUpdate);
  }

  getFollower() {
    this.user.where("email", "==", this.user_email).onSnapshot(data => {
      followingUsers = data._changes[0]._document._data.following;
      if (followingUsers != null) {
        userNumber = followingUsers.length;
        this.setState({
          followingUsers,
          userNumber
        });
      } else {
        this.setState({
          userNumber: 0
        });
      }
    });
  }

  // getFollowerMine() {
  //   this.followDoc.onSnapshot(data => {
  //     followingUsers = data._data.following;
  //     userNumber = followingUsers.length;
  //     this.setState({
  //       followingUsers,
  //       userNumber
  //     });
  //   });
  // }

  componentDidMount() {
    this.getFollower();
  }

  onCollectionUpdate = querySnapshot => {
    if (querySnapshot.empty) {
      this.setState({
        PicturesLoading: false
      });
    } else {
      const pictures = [];
      querySnapshot.forEach(doc => {
        const { image, place_id } = doc.data();
        pictures.push({
          questionID: doc.id,
          image,
          place_id
        });
        this.setState({
          pictures,
          PicturesLoading: false
        });
      });
    }
  };
  getNameByEmail = email => {
    this.user
      .where("email", "==", email)
      .get()
      .then(
        (info = query => {
          query.forEach(doc => {
            this.setState({ user: doc.data().FullName });
          });
        })
      );
  };

  FollowUser = () => {
    var data = {
      userEmail: this.user_email
    };
    this.followDoc.set(
      {
        following: firebase.firestore.FieldValue.arrayUnion(this.user_email)
      },
      { merge: true }
    );
  };

  _keyExtractor = item => item.questionID;
  _ListEmptyComponent = (
    <View>
      <View elevation={3} style={{ padding: 5 }}>
        <Text style={{ textAlign: "center" }}>User is not active!</Text>
        <Image
          source={CommentsEmpty}
          style={{ height: 40, width: 40, alignSelf: "center" }}
        />
      </View>
    </View>
  );

  getImage(u) {
    if (u.image != "") {
      return (
        <Image
          source={{ uri: u.image }}
          style={{ height: 132, width: 132 }}
          resizeMode="cover"
        />
      );
    }
  }

  _renderItem = ({ item }) => (
    <View
      style={{ padding: 1, justifyContent: "center", alignItems: "center" }}
    >
      {this.getImage(item)}
    </View>
  );

  getProfileText(name) {
    n = name;
    return n.charAt(0);
  }

  getProfileBackground() {
    Colors = ["black", "#673AB7", "#3F51B5", "#FFC107", "#607D8B", "#4CAF50"];
    ColorNumber = Math.floor(Math.random() * 6);
    return Colors[ColorNumber];
  }

  render() {
    if (this.state.PicturesLoading == true) {
      ListOfPictures = (
        <View>
          <Text style={{ textAlign: "center" }}>
            Fetching Pictures, you take a chill pill
          </Text>
          <ActivityIndicator size="large" />
        </View>
      );
    } else {
      ListOfPictures = (
        <FlatList
          data={this.state.pictures}
          renderItem={this._renderItem}
          keyExtractor={this._keyExtractor}
          extraData={this.state}
          ListEmptyComponent={this._ListEmptyComponent}
          numColumns={3}
        />
      );
    }
    return (
      <View style={styles.container}>
        <Appbar.Header style={{ backgroundColor: "#009688" }}>
          <Appbar.Action
            icon="arrow-back"
            color="white"
            onPress={() => this.props.navigation.goBack()}
          />
          <Appbar.Content title="User Profile" color="white" />
        </Appbar.Header>
        <View
          style={{
            backgroundColor: "#fff",
            flexDirection: "row"
          }}
        >
          <View style={{ width: "30%", padding: 20 }}>
            <View
              style={{
                height: 100,
                width: 100,
                borderRadius: 50,
                backgroundColor: this.getProfileBackground(),
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              <Text style={{ fontSize: 50, color: "#fff", fontWeight: "bold" }}>
                {this.getProfileText(this.state.user)}
              </Text>
            </View>
          </View>
          <View
            style={{
              width: "40%",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: 70,
                  color: "black",
                  fontWeight: "bold"
                }}
              >
                {this.state.pictures.length}
              </Text>
            </View>
            <View>
              <Text
                style={{ fontWeight: "bold", fontSize: 18, color: "black" }}
              >
                Posts
              </Text>
            </View>
          </View>
          <View
            style={{
              width: "20%",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: 70,
                  color: "black",
                  fontWeight: "bold"
                }}
              >
                {this.state.userNumber}
              </Text>
            </View>
            <View>
              <Text
                style={{ fontWeight: "bold", fontSize: 18, color: "black" }}
              >
                Following
              </Text>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "row" }}>
          <View style={{ width: "30%" }}>
            <Text
              style={{
                paddingLeft: 30,
                fontWeight: "bold",
                color: "black",
                fontSize: 20
              }}
            >
              {this.state.user}
            </Text>
          </View>
          <View style={{ paddingLeft: 60 }}>
            <TouchableOpacity
              style={{
                paddingHorizontal: 50,
                paddingVertical: 5,
                backgroundColor: "#3F51B5",
                borderRadius: 5
              }}
              onPress={() => this.FollowUser()}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>
                Follow Traveller
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ padding: 1, backgroundColor: "#fff" }} />
        <View style={{ padding: 1, backgroundColor: "#EDEEF3" }} />

        {ListOfPictures}
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
