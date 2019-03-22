import React, { Component } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Image,
  ScrollView,
  ActivityIndicator
} from "react-native";
import { TextInput, Button } from "react-native-paper";
import firebase from "react-native-firebase";

export default class Profile extends Component {
  constructor(props) {
    super(props);
    this.user = this.props.navigation.getParam("user", null); // the current user email
    this.state = {
      pictures: [],
      PicturesLoading: true
    };
    this.ref = firebase
      .firestore()
      .collection("Questions")
      .where("asked_by", "==", this.user);
    this.ref.onSnapshot(this.onCollectionUpdate);
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
}
