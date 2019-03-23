import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  Alert,
  ActivityIndicator,
  ScrollView
} from "react-native";
import Icon from "react-native-vector-icons/SimpleLineIcons";
import firebase from "react-native-firebase";
import ImagePicker from "react-native-image-picker";
import RNGooglePlaces from "react-native-google-places";
import { TextInput, Button } from "react-native-paper";
import { confidenceSort } from "../Sorts/ConfidenceSort";
import FullWidthImage from "../CustomLibrary/FullWidthImage";
const CommentsEmpty = require("../../src/images/comments_empty.jpg");
export default class LocationFetch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showInput: false,
      addressQuery: "",
      predictions: [],
      selectedPlace: [], // to hold the value of the selected place, quite self explanatory
      questions: [], // array to hold all the questions and the id of who asked them, about a particular place
      question: "", // state for textinput to ask a question
      loading: false, // for when we submit a question
      user: null, // a state to hold the value of current user email
      user_email: null,
      imageSource: [],
      QuestionsLoading: false,
      ImageUploadLoading: false
    };
    this.user = firebase.firestore().collection("Users");
    this.ref = firebase.firestore().collection("Questions");
    this.refStorage = firebase.storage();
  }

  componentDidMount() {
    this.unsubscribe = firebase.auth().onAuthStateChanged(user => {
      this.setState({ user_email: user.email });
      this.getNameByEmail(user.email);
    });
  }
  getNameByEmail = email => {
    console.log("in here");
    this.user
      .where("email", "==", email)
      .get()
      .then(
        (info = query => {
          query.forEach(doc => {
            console.log(doc.data().FullName + "in hereat");
            this.setState({ user_email: doc.data().FullName });
          });
        })
      );
  };

  getQuestions = place => {
    this.ref
      .where("place_id", "==", place.placeID)
      .orderBy("confidence_sort", "desc")
      .onSnapshot(this.onCollectionUpdate); // match the place_id and get questions about that place
  };

  onCollectionUpdate = querySnapshot => {
    if (querySnapshot.empty) {
      console.log("No questions");
      this.setState({ questions: [] });
    } else {
      const questions = [];
      querySnapshot.forEach(doc => {
        const {
          question,
          upvote,
          downvote,
          asked_by,
          asked_by_name,
          image,
          image_height
        } = doc.data();
        questions.push({
          questionID: doc.id, //name of the doc pertaining that question
          question, //the question
          upvote,
          downvote,
          asked_by,
          asked_by_name,
          image,
          image_height
        });
        this.setState({
          questions: questions, // we push the entire data, each time, after each iteration as appending a state-array can lead to race conditions due to its asynchronous nature
          QuestionsLoading: false
        });
      });
    }
  };

  onOpenPickerPress = () => {
    console.log("picker");
    RNGooglePlaces.openPlacePickerModal()
      .then(place => {
        this.setState({
          selectedPlace: place,
          questions: []
        });
        this.getQuestions(place); // As soon as we select the place, load the questions
        console.log(place);
      })
      .catch(error => console.log(error.message));
  };

  onOpenAutocompletePress = () => {
    RNGooglePlaces.openAutocompleteModal()
      .then(place => {
        this.setState({
          selectedPlace: place,
          questions: []
        });
        this.getQuestions(place); // As soon as we select the place, load the questions
      })
      .catch(error => console.log(error.message));
  };

  upvote = (docID, upvotes, downvotes) => {
    this.setState({ upvote: upvotes + 1 });
    this.ref
      .doc(docID)
      .get()
      .then(
        (update = querySnapshot => {
          if (querySnapshot.exists) {
            this.ref
              .doc(docID)
              .collection("upvotedBy")
              .where("userID", "==", this.state.user_email)
              .get()
              .then(
                (searchInUpvotes = query_for_upvote => {
                  if (!query_for_upvote.empty) {
                    Alert.alert("You have already upvoted this!");
                  } else {
                    this.ref
                      .doc(docID)
                      .collection("downvotedBy")
                      .where("userID", "==", this.state.user_email)
                      .get()
                      .then(
                        (searchInDownvotes = query_for_downvote => {
                          if (!query_for_downvote.empty) {
                            query_for_downvote.forEach(doc => doc.ref.delete());
                            this.ref
                              .doc(docID)
                              .collection("upvotedBy")
                              .add({ userID: this.state.user_email });
                            this.ref.doc(docID).update({
                              upvote: upvotes + 1,
                              downvote: downvotes - 1
                            });
                            this.ref.doc(docID).update({
                              confidence_sort: confidenceSort(
                                upvotes + 1,
                                upvotes + downvotes
                              )
                            });
                          } else {
                            this.ref
                              .doc(docID)
                              .collection("upvotedBy")
                              .add({ userID: this.state.user_email });
                            this.ref.doc(docID).update({ upvote: upvotes + 1 });
                            this.ref.doc(docID).update({
                              confidence_sort: confidenceSort(
                                upvotes + 1,
                                upvotes + downvotes + 1
                              )
                            });
                          }
                        })
                      );
                  }
                })
              );
          } else {
            Alert.alert("Something went wrong");
          }
        })
      );
  };

  downvote = (docID, upvotes, downvotes) => {
    this.setState({ downvote: downvotes + 1 });
    this.ref
      .doc(docID)
      .get()
      .then(
        (update = querySnapshot => {
          if (querySnapshot.exists) {
            this.ref
              .doc(docID)
              .collection("downvotedBy")
              .where("userID", "==", this.state.user_email)
              .get()
              .then(
                (searchInDownvotes = query_for_upvote => {
                  if (!query_for_upvote.empty) {
                    Alert.alert("You have already downvoted this!");
                  } else {
                    this.ref
                      .doc(docID)
                      .collection("upvotedBy")
                      .where("userID", "==", this.state.user_email)
                      .get()
                      .then(
                        (searchInUpvotes = query_for_upvote => {
                          if (!query_for_upvote.empty) {
                            query_for_upvote.forEach(doc => doc.ref.delete());
                            this.ref
                              .doc(docID)
                              .collection("downvotedBy")
                              .add({ userID: this.state.user_email });
                            this.ref.doc(docID).update({
                              downvote: downvotes + 1,
                              upvote: upvotes - 1
                            });
                            this.ref.doc(docID).update({
                              confidence_sort: confidenceSort(
                                upvotes - 1,
                                upvotes + downvotes
                              )
                            });
                          } else {
                            this.ref
                              .doc(docID)
                              .collection("downvotedBy")
                              .add({ userID: this.state.user_email });
                            this.ref
                              .doc(docID)
                              .update({ downvote: downvotes + 1 });
                            this.ref.doc(docID).update({
                              confidence_sort: confidenceSort(
                                upvotes,
                                upvotes + downvotes + 1
                              )
                            });
                          }
                        })
                      );
                  }
                })
              );
          } else {
            Alert.alert("Something went wrong");
          }
        })
      );
  };

  makeid = length => {
    var text = "";
    var possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < length; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  };

  openImagePicker = () => {
    ImagePicker.showImagePicker(response => {
      console.log("Response = ", response);

      if (response.didCancel) {
        console.log("User cancelled image picker");
      } else if (response.error) {
        console.log("ImagePicker Error: ", response.error);
      } else if (response.customButton) {
        console.log("User tapped custom button: ", response.customButton);
      } else {
        const source = {
          uri: response.uri,
          height: response.height,
          timestamp: response.timestamp
        };
        console.log(source);
        // You can also display the image using data:
        // const source = { uri: 'data:image/jpeg;base64,' + response.data };
        this.setState({
          imageSource: source
        });
        Alert.alert("Image selected. Write a comment or press enter directly.");
      }
    });
  };

  postQuestion = () => {
    this.setState({ loading: true });
    console.log(this.state.imageSource);
    if (this.state.imageSource == "" && this.state.question == "") {
      this.setState({ loading: false });
      Alert.alert("Please select a picture to upload or write something.");
    } else if (this.state.imageSource == "") {
      console.log("Im here");
      image_source = "";
      var data = {
        question: this.state.question,
        asked_by: this.state.user_email,
        place_id: this.state.selectedPlace.placeID,
        upvote: 0,
        downvote: 0,
        asked_by_name: this.state.user_email,
        image: image_source
      };
      this.ref
        .add(data)
        .then(this.setState({ loading: false, question: "", imageSource: "" }))
        .then(docRef => {
          this.upvote(docRef.id, 0, 0);
        })
        .catch(error => console.error("Error adding document: ", error));
    } else {
      this.setState({ ImageUploadLoading: true });
      const image = this.state.imageSource.uri;
      const imageRef = firebase
        .storage()
        .ref()
        .child(this.state.user_email + "/" + this.makeid(15) + ".jpg");
      let mime = "image/jpg";
      imageRef
        .put(image, { contentType: mime })
        .then(() => {
          return imageRef.getDownloadURL();
        })
        .then(url => {
          image_source = url;
          console.log(url);
          var data = {
            question: this.state.question,
            asked_by: this.state.user_email,
            place_id: this.state.selectedPlace.placeID,
            upvote: 0,
            downvote: 0,
            asked_by_name: this.state.user_email,
            image: image_source,
            image_height: this.state.imageSource.height
          };
          this.ref
            .add(data)
            .then(
              this.setState({
                loading: false,
                question: "",
                imageSource: "",
                ImageUploadLoading: false
              })
            )
            .then(docRef => {
              this.upvote(docRef.id, 0, 0);
            })
            .catch(error => console.error("Error adding document: ", error));
        })
        .catch(error => {
          console.log(error);
        });
    }
  }; // a question's collection will have the fields-the question, the asker's user id and the selected place id. Also, a collection of answers

  _keyExtractor = (item, index) => item.questionID;
  _renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate("AnswersScreen", {
          place: placeDetail,
          question: item,
          user: user
        });
      }}
    >
      <View elevation={3} style={[styles.shadowContainer, { padding: 5 }]}>
        <TouchableOpacity 
          onPress = {() => {
            navigation.navigate("ProfileScreen", {
              user: item.asked_by
            });
          }}
        >
          <Text style={{ textAlign: "left", fontSize: 10 }}>
            u/{item.asked_by_name}
          </Text>
        </TouchableOpacity>
        <Text style={{ textAlign: "left", color: "black" }}>
          {item.question}
        </Text>
        {item.image != "" && <FullWidthImage source={{ uri: item.image }} />}
          
        <View style={styles.IconContainer}>
          <Button
            onPress={() =>
              this.upvote(item.questionID, item.upvote, item.downvote)
            }
            icon="thumb-up"
            compact
          >
            <Text>{item.upvote}</Text>
          </Button>
          <Button
            onPress={() =>
              this.downvote(item.questionID, item.upvote, item.downvote)
            }
            icon="thumb-down"
            compact
          >
            <Text>{item.downvote}</Text>
          </Button>
        </View>
      </View>
    </TouchableOpacity>
  );
  render() {
    QuestionsFetch = null;
    if (this.state.QuestionsLoading == true) {
      QuestionsFetch = (
        <View>
          <Text style={{ textAlign: "center" }}>Fetching Questions</Text>
          <ActivityIndicator size="large" />
        </View>
      );
    } else if (this.state.ImageUploadLoading == true) {
      QuestionsFetch = (
        <View>
          <Text style={{ textAlign: "center" }}>
            Uploading the image and making a post
          </Text>
          <ActivityIndicator size="large" />
        </View>
      );
    } else {
      QuestionsFetch = (
        <FlatList
          data={this.state.questions}
          renderItem={this._renderItem}
          ListEmptyComponent={
            <View>
              <View
                elevation={3}
                style={[styles.shadowContainer, { padding: 5 }]}
              >
                <Text style={{ textAlign: "center" }}>
                  Oh my, the comments are so empty!
                </Text>
                <Image
                  source={CommentsEmpty}
                  style={{ height: 40, width: 40, alignSelf: "center" }}
                />
              </View>
            </View>
          }
          extraData={this.state}
          keyExtractor={this._keyExtractor}
        />
      );
    }
    placeDetail = this.state.selectedPlace;
    navigation = this.props.navigation;
    user = this.state.user_email;
    return (
      <View style={styles.container}>
        <View>
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              style={[styles.inputLauncher, { width: "80%", height: 40 }]}
              onPress={this.onOpenAutocompletePress}
            >
              <Text style={{ color: "#70818A" }}>Where to?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                { width: "20%", height: 40, backgroundColor: "#F3F7F9" }
              ]}
              onPress={this.onOpenPickerPress}
            >
              <Icon name="map" />
            </TouchableOpacity>
          </View>

          {placeDetail.name && ( //Only be visible when a place is selected
            <View style={{ height: "87%" }}>
              <ScrollView>
                <View elevation={3} style={[styles.shadowContainer]}>
                  <Text style={{ color: "black", textAlign: "center" }}>
                    {placeDetail.name}
                  </Text>
                  <Text style={{ textAlign: "center" }}>At</Text>
                  <Text style={{ color: "black", textAlign: "center" }}>
                    {placeDetail.address}
                  </Text>
                  {/* <Text style={{ color: "red" }}>{placeDetail.phoneNumber}</Text>
                      <Text style={{ color: "red" }}>{placeDetail.website}</Text> */}
                </View>
                <View style={{ paddingBottom: 20 }}>{QuestionsFetch}</View>
              </ScrollView>
            </View>
          )}
        </View>

        {placeDetail.name && (
          <View
            style={{ flexDirection: "row", position: "absolute", bottom: 0 }}
          >
            <TextInput
              label="Have an opinion about this place?"
              placeholder="Shoot away!"
              value={this.state.question}
              onChangeText={question => this.setState({ question })}
              style={{ width: "70%", backgroundColor: "#F3F7F9" }}
            />
            <Button
              onPress={() => this.openImagePicker()}
              style={{ width: "15%", backgroundColor: "#F3F7F9" }}
              compact
              icon="image"
            />
            <Button
              onPress={() => this.postQuestion()}
              loading={this.state.loading}
              style={{ width: "15%", backgroundColor: "#F3F7F9" }}
              compact
              icon="send"
            />
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  shadowContainer: {
    backgroundColor: "#fff",
    marginRight: 10,
    marginBottom: 5,
    marginTop: 5,
    borderRadius: 10,
    padding: 2,
    shadowOffset: { width: 10, height: 10 },
    shadowColor: "black",
    shadowOpacity: 1.0,
    justifyContent: "center",
    width: "100%"
  },
  IconContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    justifyContent: "flex-start",
    width: "100%",
    flexWrap: "wrap"
  },
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 12,
    paddingTop: 45
  },
  button: {
    backgroundColor: "#263238",
    flexDirection: "row",
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10
  },
  buttonText: {
    color: "white"
  },
  inputLauncher: {
    backgroundColor: "#F3F7F9",
    width: "100%",
    borderRadius: 4,
    height: 35,
    justifyContent: "center",
    paddingLeft: 10,
    marginBottom: 16
  },
  inputWrapper: {
    backgroundColor: "#F3F7F9",
    width: "100%",
    borderRadius: 2,
    justifyContent: "center",
    paddingHorizontal: 8
  },
  input: {
    color: "#222B2F",
    height: 35,
    fontSize: 15,
    paddingVertical: 4
  },
  list: {
    marginTop: 16,
    height: Dimensions.get("window").height - 70
  },
  listItemWrapper: {
    backgroundColor: "transparent",
    height: 56
  },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    height: "100%"
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#DAE4E9",
    width: "92%",
    marginHorizontal: 16,
    opacity: 0.6
  },
  primaryText: {
    color: "#222B2F",
    fontSize: 15,
    marginBottom: 3
  },
  placeMeta: {
    flex: 1,
    marginLeft: 15
  },
  secondaryText: {
    color: "#9BABB4",
    fontSize: 13
  },
  listIcon: {
    width: 25,
    height: 25
  }
});
