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
import FullWidthImage from "../CustomLibrary/FullWidthImage";
const CommentsEmpty = require("../../src/images/comments_empty.jpg");

export default class Answers extends Component {
  constructor(props) {
    super(props);
    this.selectedPlace = this.props.navigation.getParam("place", null); // place that was selected in the last page
    this.question = this.props.navigation.getParam("question", null); // question from the last page
    this.user = this.props.navigation.getParam("user", null); // the current user email
    this.state = {
      answer: "", // state to hold the value of the textinput to answer the question
      answers: [], // an array to display the list of answers
      loading: false,
      AnswerLoading: true
    };
    this.ref = firebase
      .firestore()
      .collection("Questions")
      .doc(this.question.questionID)
      .collection("Answers");
    this.ref.onSnapshot(this.onCollectionUpdate);
  }

  onCollectionUpdate = querySnapshot => {
    if (querySnapshot.empty) {
      this.setState({
        AnswerLoading: false
      });
    } else {
      const answers = [];
      querySnapshot.forEach(doc => {
        const { answer, answered_by } = doc.data();
        answers.push({
          AnswerID: doc.id,
          answer,
          answered_by
        });
        this.setState({
          answers: answers,
          AnswerLoading: false
        });
      });
    }
  };

  postAnswer = () => {
    this.setState({ loading: true });
    var data = {
      answer: this.state.answer,
      answered_by: this.user
    };
    this.ref.add(data).then(this.setState({ loading: false, answer: "" }));
  };

  _keyExtractor = (item, index) => item.AnswerID;

  _renderItem = ({ item }) => (
    <View style={{ padding: 20 }}>
      {console.log("not empty")}
      <Text style={{ textAlign: "left" }}>u/{item.answered_by}</Text>
      <Text style={{ textAlign: "left", fontWeight: "bold" }}>
        {item.answer}
      </Text>
    </View>
  );

  _ListEmptyComponent = (
    <View>
      {console.log("empty")}
      <View elevation={3} style={{ padding: 5 }}>
        <Text style={{ textAlign: "center" }}>
          Oh my, the replies are so empty!
        </Text>
        <Image
          source={CommentsEmpty}
          style={{ height: 40, width: 40, alignSelf: "center" }}
        />
      </View>
    </View>
  );

  render() {
    console.log(this.state.answers);
    console.log(this.state.AnswerLoading);
    ListOfAnswers = null;
    if (this.state.AnswerLoading == true) {
      ListOfAnswers = (
        <View>
          <Text style={{ textAlign: "center" }}>Fetching Questions</Text>
          <ActivityIndicator size="large" />
        </View>
      );
    } else {
      ListOfAnswers = (
        <View>
          <FlatList
            data={this.state.answers}
            extraData={this.state}
            keyExtractor={this._keyExtractor}
            renderItem={this._renderItem}
            ListEmptyComponent={this._ListEmptyComponent}
          />
        </View>
      );
    }

    return (
      <View>
        <View>
          <ScrollView>
            <Text>Place:{this.selectedPlace.name}</Text>
            <Text>Question:{this.question.question}</Text>
            <FullWidthImage source={{ uri: this.question.image }} />
            {ListOfAnswers}
          </ScrollView>
        </View>
        {/* <View
          style={{
            flexDirection: "row",
            bottom: -25
          }}
        >
          <TextInput
            style={{ width: "80%", backgroundColor: "#F3F7F9" }}
            label="Reply to this comment"
            value={this.state.answer}
            onChangeText={answer => this.setState({ answer })}
          />
          <Button
            style={{ width: "20%", backgroundColor: "#F3F7F9" }}
            onPress={() => this.postAnswer()}
            icon="send"
            loading={this.state.loading}
            compact
          />
        </View> */}
      </View>
    );
  }
}
