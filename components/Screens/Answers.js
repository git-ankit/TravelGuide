import React, { Component } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Image,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  TextInput
} from "react-native";
import { Button, Appbar } from "react-native-paper";
import firebase from "react-native-firebase";
import FullWidthImage from "../CustomLibrary/FullWidthImage";
import Icon from "react-native-vector-icons/SimpleLineIcons";

const CommentsEmpty = require("../../src/images/comments_empty.png");

export default class Answers extends Component {
  constructor(props) {
    super(props);
    this.selectedPlace = this.props.navigation.getParam("place", null); // place that was selected in the last page
    this.question = this.props.navigation.getParam("question", null); // question from the last page
    this.user = this.props.navigation.getParam("user_email", null); // the current user email
    this.user_name = this.props.navigation.getParam("user_name", null);
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
    // Fetching Data from Firebase
    if (querySnapshot.empty) {
      this.setState({
        AnswerLoading: false
      });
    } else {
      const answers = [];
      querySnapshot.forEach(doc => {
        const { answer, answered_by, answered_by_name } = doc.data();
        answers.push({
          AnswerID: doc.id,
          answer,
          answered_by,
          answered_by_name
        });
        this.setState({
          answers: answers,
          AnswerLoading: false
        });
      });
    }
  };

  getProfileText(name) {
    // 1st Letter of Name
    n = name;
    return n.charAt(0);
  }

  getProfileBackground() {
    // Getting Background color for Profile
    Colors = ["black", "#673AB7", "#3F51B5", "#FFC107", "#607D8B", "#4CAF50"];
    ColorNumber = Math.floor(Math.random() * 6);
    return Colors[ColorNumber];
  }
  postAnswer = () => {
    // Post answer in Firebase
    this.setState({ loading: true });
    var data = {
      answer: this.state.answer,
      answered_by: this.user,
      answered_by_name: this.user_name
    };
    this.ref.add(data).then(this.setState({ loading: false, answer: "" }));
  };

  _keyExtractor = (item, index) => item.AnswerID;

  _renderItem = ({ item }) => (
    <View>
      <View elevation={1} style={[styles.shadowContainer, { padding: 5 }]}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("ProfileScreen", {
              user: item.answered_by
            });
          }}
        >
          <View
            style={{ flexDirection: "row", padding: 5, alignItems: "center" }}
          >
            <View style={{ width: "15%" }}>
              <View
                style={{
                  height: 50,
                  width: 50,
                  borderRadius: 25,
                  backgroundColor: this.getProfileBackground(),
                  justifyContent: "center",
                  alignItems: "center"
                }}
              >
                <Text
                  style={{ fontSize: 25, color: "#fff", fontWeight: "bold" }}
                >
                  {this.getProfileText(item.answered_by_name)}
                </Text>
              </View>
            </View>
            <View style={{ width: "85%" }}>
              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: 18,
                  color: "black",
                  paddingLeft: 5
                }}
              >
                {item.answered_by_name}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        <View style={{ height: 1, backgroundColor: "#EDEEF3" }} />
        <View
          style={{ padding: 20, flexDirection: "row", alignItems: "center" }}
        >
          <View style={{ paddingRight: 5 }}>
            <Icon name="pencil" />
          </View>
          <View style={{ paddingLeft: 10 }}>
            <Text style={{ color: "black" }}>{item.answer}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  _ListEmptyComponent = (
    <View>
      {console.log("empty")}
      <View elevation={3} style={{ padding: 15 }}>
        <Text
          style={{ textAlign: "center", fontWeight: "bold", color: "#fff" }}
        >
          No Comments, be the first to reply!
        </Text>
        <Image
          source={CommentsEmpty}
          style={{ height: 40, width: 40, alignSelf: "center" }}
        />
      </View>
    </View>
  );

  render() {
    ImageSection = null;
    if (this.question.image != null) {
      ImageSection = <FullWidthImage source={{ uri: this.question.image }} />;
    }
    QuestionSection = null;
    if (this.question.question != "") {
      QuestionSection = (
        <View style={styles.QuestionBar}>
          <View
            style={{
              paddingVertical: 10,
              paddingHorizontal: 5,
              flexDirection: "row",
              alignItems: "center"
            }}
          >
            <View style={{ paddingRight: 5 }}>
              <Icon size={20} name="rocket" />
            </View>
            <Text style={{ color: "black", fontSize: 25, fontWeight: "bold" }}>
              {this.question.question}
            </Text>
          </View>
        </View>
      );
    }
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
      <View style={styles.container}>
        <Appbar.Header style={{ backgroundColor: "#009688" }}>
          <Appbar.Action
            icon="arrow-back"
            color="white"
            onPress={() => this.props.navigation.goBack()}
          />
          <Appbar.Content title="Comments" color="white" />
        </Appbar.Header>
        <View style={{ height: "85%" }}>
          <ScrollView>
            <View
              style={{
                backgroundColor: "#fff",
                padding: 15,
                flexDirection: "row",
                alignItems: "center"
              }}
            >
              <View style={{ paddingRight: 5 }}>
                <Icon name="location-pin" size={18} />
              </View>
              <Text style={{ color: "black", fontSize: 18 }}>
                {this.selectedPlace.name}
              </Text>
            </View>
            <View style={{ height: 1, backgroundColor: "#EDEEF3" }} />
            {QuestionSection}
            {ImageSection}
            <View>{ListOfAnswers}</View>
          </ScrollView>
        </View>
        {/* Bottom Bar */}
        <View
          style={{
            marginHorizontal: 15
          }}
        >
          <View
            style={{
              flexDirection: "row",
              position: "relative",
              bottom: 10,
              backgroundColor: "#F2F3F5",
              borderRadius: 50,
              justifyContent: "center"
            }}
          >
            <View style={{ width: "85%", padding: 10 }}>
              <TextInput
                placeholder="Reply to this comment"
                placeholderTextColor="#5F6267"
                value={this.state.answer}
                onChangeText={answer => this.setState({ answer })}
                style={{
                  width: "100%",
                  borderRadius: 25,
                  padding: 5
                }}
              />
            </View>
            <View
              style={{
                width: "15%",
                paddingVertical: 10,
                paddingRight: 5
              }}
            >
              <TouchableOpacity
                style={{
                  height: 40,
                  width: 40,
                  borderRadius: 20,
                  justifyContent: "center",
                  alignItems: "center"
                }}
                onPress={() => this.postAnswer()}
              >
                <Icon name="note" color="#3F51B5" size={24} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {/* Bottom Bar */}
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
    backgroundColor: "#222222"
  },
  QuestionBar: {
    paddingTop: 5,
    paddingHorizontal: 5,
    backgroundColor: "#fff",
    justifyContent: "center",
    paddingBottom: 5
  },
  shadowContainer: {
    backgroundColor: "#fff",
    marginRight: 10,
    marginBottom: 5,
    marginTop: 5,
    borderRadius: 1,
    padding: 2,
    shadowOffset: { width: 10, height: 10 },
    shadowColor: "black",
    shadowOpacity: 1.0,
    justifyContent: "center",
    width: "100%"
  }
});
