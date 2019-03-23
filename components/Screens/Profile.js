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
import FullWidthImage from "../CustomLibrary/FullWidthImage";
import firebase from "react-native-firebase";
const CommentsEmpty = require("../../src/images/comments_empty.jpg");
const loading_gif = require("../../src/images/loading.gif");
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
  _keyExtractor = (item) => item.questionID
  _ListEmptyComponent = (
    <View>
      <View elevation={3} style={{ padding: 5 }}>
        <Text style={{ textAlign: "center" }}>
          Oh my, no uploads or posts here!
        </Text>
        <Image
          source={CommentsEmpty}
          style={{ height: 40, width: 40, alignSelf: "center" }}
        />
      </View>
    </View>
  );

  _renderItem = ({item}) => (
    <View>
      <Image 
        source = {item.image == ''? loading_gif : {uri: item.image}}
        style ={{height: 150, width: 150}}
        resizeMode = 'cover'
      />
    </View>
  )
  render () {
    console.log(this.state.pictures)
    console.log(this.user)
    if(this.state.PicturesLoading == true){
      ListOfPictures = (
        <View>
          <Text style={{ textAlign: "center" }}>Fetching Pictures, you take a chill pill</Text>
          <ActivityIndicator size="large" />
        </View>
      )
    } else {
      ListOfPictures = (
        <FlatList
          data = {this.state.pictures}
          renderItem = {this._renderItem}
          keyExtractor = {this._keyExtractor}
          extraData = {this.state}
          ListEmptyComponent = {this._ListEmptyComponent}
          numColumns = {3}
        />
      )
    }
    return(
      <View>
        {ListOfPictures}
      </View>
    )
  }
}
