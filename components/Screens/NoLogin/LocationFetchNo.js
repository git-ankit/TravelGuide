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
  Linking,
  ActivityIndicator,
  ScrollView,
  TextInput,
  RefreshControl
} from "react-native";
import Icon from "react-native-vector-icons/SimpleLineIcons";
import firebase from "react-native-firebase";
import ImagePicker from "react-native-image-picker";
import RNGooglePlaces from "react-native-google-places";
import { Button } from "react-native-paper";
import { confidenceSort } from "../../Sorts/ConfidenceSort";
import FullWidthImage from "../../CustomLibrary/FullWidthImage";
import _ from "lodash";
import call from "react-native-phone-call";

const CommentsEmpty = require("../../../src/images/comments_empty.png");
const LoginBackgroundImage = require("../../../src/LoginBG.png");

export default class LocationFetchNo extends Component {
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
      imageSource: [],
      QuestionsLoading: false,
      ImageUploadLoading: false,
      placePhoto: null,
      photoPresent: false,
      placeSelected: false,
      refreshing: false
    };
    this.user = firebase.firestore().collection("Users");
    this.ref = firebase.firestore().collection("Questions");
    this.refStorage = firebase.storage();
  }

  getProfileText(name) {
    n = name;
    return n.charAt(0);
  }

  getProfileBackground() {
    Colors = ["black", "#673AB7", "#3F51B5", "#FFC107", "#607D8B", "#4CAF50"];
    ColorNumber = Math.floor(Math.random() * 6);
    return Colors[ColorNumber];
  }

  _onRefresh = () => {
    this.setState(
      { isFetching: true },
      (fetchingQuestions = () => {
        this.getQuestions(this.state.selectedPlace);
      })
    );
  };

  getQuotes() {
    Quotes = [
      "“Man cannot discover new oceans unless he has the courage to lose sight of the shore.”",
      "“Remember that happiness is a way of travel – not a destination.”",
      "“It is not down in any map; true places never are.”",
      "“Life is either a daring adventure or nothing at all.”",
      "“Better to see something once than hear about it a thousand times”",
      "“Adventure may hurt you but monotony will kill you.”",
      "“Dare to live the life you’ve always wanted.”",
      "“Wanderlust: n. a strong desire for or impulse to wander or travel and explore the world”",
      "“Don't listen to what they say. Go see.”"
    ];
    QuoteNumber = Math.floor(Math.random() * 9);
    return Quotes[QuoteNumber];
  }

  getPhoneWeb(number, web) {
    const args = {
      number: number,
      prompt: false
    };
    PhoneNumber = null;
    Website = null;
    OutPut = null;
    n = number;
    w = web;
    if (n != null) {
      PhoneNumber = (
        <TouchableOpacity onPress={() => call(args)}>
          <View
            style={{
              paddingHorizontal: 15,
              paddingVertical: 5,
              alignItems: "center",
              width: 50,
              height: 30,
              borderRadius: 5,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#8BC34A"
            }}
          >
            <Icon color="#fff" size={18} name="phone" />
          </View>
        </TouchableOpacity>
      );
    }
    if (w != null) {
      Website = (
        <TouchableOpacity onPress={() => Linking.openURL(w)}>
          <View
            style={{
              paddingHorizontal: 15,
              paddingVertical: 5,
              alignItems: "center",
              borderRadius: 5,
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "row"
            }}
          >
            <View style={{ paddingRight: 5 }}>
              <Icon name="link" />
            </View>
            <Text style={{ fontWeight: "bold", color: "#3F51B5" }}>{w}</Text>
          </View>
        </TouchableOpacity>
      );
    }
    return (
      <View style={{ flexDirection: "row", paddingRight: 20 }}>
        <View style={{ width: "80%", alignItems: "flex-start" }}>
          {Website}
        </View>
        <View style={{ width: "20%", alignItems: "flex-end" }}>
          {PhoneNumber}
        </View>
      </View>
    );
  }

  getRatings(ratings) {
    R = Math.round(ratings);
    return R;
  }

  getTypes(details) {
    Types = null;
    if (details.length == 0) {
      return (Types = null);
    }
    if (details.length > 0) {
      temp = details[0];
      temp2 = temp.replace("_", " ");
      temp3 = temp2.replace("_", " ");
      Types = _.startCase(_.toLower(temp3));
      return Types;
    }
  }

  getNameByEmail = email => {
    this.user
      .where("email", "==", email)
      .get()
      .then(
        (info = query => {
          query.forEach(doc => {
            this.setState({ user: doc.data().FullName, userDoc: doc.id });
          });
        })
      );
  };

  getQuestions = place => {
    this.ref
      .where("place_id", "==", place.placeID)
      .orderBy("confidence_sort", "desc")
      .onSnapshot(this.onCollectionUpdate); // match the place_id and get questions about that place
    this.setState({ refreshing: false });
  };

  onCollectionUpdate = querySnapshot => {
    if (querySnapshot.empty) {
      // console.log("No questions");
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
          image_height,
          confidence_sort,
          timestamp
        } = doc.data();
        questions.push({
          questionID: doc.id, //name of the doc pertaining that question
          question, //the question
          upvote,
          downvote,
          asked_by,
          asked_by_name,
          image,
          image_height,
          confidence_sort,
          timestamp
        });
        this.setState({
          questions: questions, // we push the entire data, each time, after each iteration as appending a state-array can lead to race conditions due to its asynchronous nature
          QuestionsLoading: false
        });
      });
    }
  };

  onOpenPickerPress = async () => {
    RNGooglePlaces.openPlacePickerModal()
      .then(place => {
        // console.log(place);
        this.setState({
          selectedPlace: place,
          questions: [],
          placeSelected: true
        });
        RNGooglePlaces.getPlacePhotos(place.placeID).then(photoMeta => {
          // console.log(photoMeta);
          if (photoMeta[0].uri != null) {
            this.setState({
              placePhoto: photoMeta,
              photoPresent: true
            });
          }
        });
        this.getQuestions(place); // As soon as we select the place, load the questions
        // console.log(place);
      })
      .catch(error => console.log(error.message));
  };

  onOpenAutocompletePress = () => {
    RNGooglePlaces.openAutocompleteModal()
      .then(place => {
        this.setState({
          selectedPlace: place,
          questions: [],
          placeSelected: true
        });
        RNGooglePlaces.getPlacePhotos(place.placeID).then(photoMeta => {
          if (photoMeta[0].uri != null) {
            this.setState({
              placePhoto: photoMeta,
              photoPresent: true
            });
          }
        });
        this.getQuestions(place); // As soon as we select the place, load the questions
      })
      .catch(error => console.log(error.message));
  };

  upvote = (docID, upvotes, downvotes) => {
    alert("Please login to vote");
  };

  downvote = (docID, upvotes, downvotes) => {
    alert("Please login to vote");
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
      // console.log("Response = ", response);

      if (response.didCancel) {
        // console.log("User cancelled image picker");
      } else if (response.error) {
        // console.log("ImagePicker Error: ", response.error);
      } else if (response.customButton) {
        // console.log("User tapped custom button: ", response.customButton);
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
    ts = Date.now();
    this.setState({ loading: true });
    if (this.state.imageSource == "" && this.state.question == "") {
      this.setState({ loading: false });
      Alert.alert("Please select a picture to upload or write something.");
    } else if (this.state.imageSource == "") {
      image_source = "";
      var data = {
        question: this.state.question,
        asked_by: this.state.user_email,
        place_id: this.state.selectedPlace.placeID,
        upvote: 0,
        downvote: 0,
        asked_by_name: this.state.user,
        image: image_source,
        timestamp: ts
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
            asked_by_name: this.state.user,
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
      activeOpacity={1}
      onPress={() => {
        navigation.navigate("AnswersScreen", {
          place: placeDetail,
          question: item,
          user_email: user,
          user_name: user_name
        });
      }}
    >
      <View elevation={1} style={[styles.shadowContainer, { padding: 5 }]}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("ProfileNoScreen", {
              user: item.asked_by,
              userID: this.state.userDoc
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
                  {this.getProfileText(item.asked_by_name)}
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
                {item.asked_by_name}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        <View style={{ height: 1, backgroundColor: "#EDEEF3" }} />
        <View style={{ padding: 10 }}>
          <Text style={{ textAlign: "left", color: "black" }}>
            {item.question}
          </Text>
        </View>
        {item.image != "" && <FullWidthImage source={{ uri: item.image }} />}
        <View style={{ height: 1, backgroundColor: "#EDEEF3" }} />
        <View style={{ flexDirection: "row" }}>
          <View style={styles.IconContainer}>
            <Button
              onPress={() =>
                this.upvote(item.questionID, item.upvote, item.downvote)
              }
              color="#4CAF50"
              icon="thumb-up"
              compact
            >
              <Text>{item.upvote}</Text>
            </Button>
            <Button
              onPress={() =>
                this.downvote(item.questionID, item.upvote, item.downvote)
              }
              color="#F44336"
              icon="thumb-down"
              compact
            >
              <Text>{item.downvote}</Text>
            </Button>
          </View>
          <View>
            <TouchableOpacity
              style={{
                alignItems: "center",
                padding: 6
              }}
              onPress={() => {
                navigation.navigate("AnswersNoScreen", {
                  place: placeDetail,
                  question: item,
                  user: user
                });
              }}
            >
              <Icon size={20} name="bubble" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
  render() {
    PlaceNotSelected = (
      <View
        style={{ padding: 15, justifyContent: "center", alignItems: "center" }}
      >
        <Text
          style={{
            fontSize: 30,
            textAlign: "center",
            fontWeight: "bold",
            color: "#222222",
            paddingBottom: 10,
            paddingTop: 100
          }}
        >
          Travel Guide
        </Text>
        <View
          style={{
            height: 350,
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <Image
            style={{
              height: 325
            }}
            resizeMode="center"
            source={LoginBackgroundImage}
          />
        </View>
        {/* Topbar Search and Map Button Start */}
        <View
          style={{
            flexDirection: "row",
            height: 100,
            padding: 10,
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <View style={{ width: "75%", justifyContent: "center" }}>
            <TouchableOpacity
              style={[styles.inputLauncher2, { height: 40, borderRadius: 15 }]}
              onPress={this.onOpenAutocompletePress}
            >
              <View style={{ flexDirection: "row" }}>
                <View style={{ justifyContent: "center", padding: 5 }}>
                  <Icon name="magnifier" color="#fff" size={15} />
                </View>
                <Text style={{ color: "#fff", padding: 5 }}>
                  Search for places
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          <View
            style={{
              width: "25%",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <TouchableOpacity
              style={[
                styles.button,
                {
                  width: 80,
                  height: 80,
                  backgroundColor: "#222222",
                  borderRadius: 80 / 2
                }
              ]}
              onPress={this.onOpenPickerPress}
            >
              <Icon name="map" color="#fff" size={20} />
            </TouchableOpacity>
          </View>
        </View>
        {/* Topbar Search and Map Button Ends */}
        <View style={styles.LineBorder} />
        <View>
          <Text style={{ fontWeight: "bold", fontSize: 20, paddingTop: 50 }}>
            {this.getQuotes()}
          </Text>
        </View>
      </View>
    );
    if (this.state.placeSelected == true) {
      PlaceNotSelected = null;
    }
    PlacePhoto = null;
    if (this.state.photoPresent == true) {
      PlacePhoto = (
        <Image
          style={{ height: 300 }}
          source={{ uri: this.state.placePhoto[0].uri }}
          resizeMode="contain"
        />
      );
    }
    QuestionsFetch = null;
    if (this.state.QuestionsLoading == true) {
      QuestionsFetch = (
        <View>
          <Text style={{ textAlign: "center" }}>Fetching Questions</Text>
          <ActivityIndicator size="large" />
        </View>
      );
    }
    // else if (this.state.ImageUploadLoading == true) {
    //   QuestionsFetch = (
    //     <View
    //       style={{
    //         justifyContent: "center",
    //         alignItems: "center",
    //         padding: 20
    //       }}
    //     >
    //       <Text style={{ textAlign: "center" }}>Uploading Image</Text>
    //       <ActivityIndicator size="large" />
    //     </View>
    //   );
    // }
    else {
      QuestionsFetch = (
        <View style={{ paddingHorizontal: 10, paddingBottom: 60 }}>
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
                    Sorry no reviews, Be the first to review this Place
                  </Text>
                  <Image
                    source={CommentsEmpty}
                    style={{ height: 40, width: 40, alignSelf: "center" }}
                  />
                </View>
              </View>
            }
            initialNumToRender={5}
            extraData={this.state}
            keyExtractor={this._keyExtractor}
          />
        </View>
      );
    }
    placeDetail = this.state.selectedPlace;
    navigation = this.props.navigation;
    user = this.state.user_email;
    user_name = this.state.user;
    ImageUploadLoading = this.state.ImageUploadLoading;
    return (
      <View style={styles.container}>
        <View>
          {PlaceNotSelected}
          {ImageUploadLoading && (
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                padding: 20
              }}
            >
              <Text style={{ textAlign: "center" }}>Uploading Image</Text>
              <ActivityIndicator size="large" />
            </View>
          )}

          {placeDetail.name &&
          !ImageUploadLoading && ( //Only be visible when a place is selected
              <View>
                {/* Topbar Search and Map Button Start */}
                <View
                  style={{
                    flexDirection: "row",
                    height: 100,
                    backgroundColor: "#fff",
                    padding: 10
                  }}
                >
                  <View style={{ width: "75%", justifyContent: "center" }}>
                    <TouchableOpacity
                      style={[
                        styles.inputLauncher,
                        { height: 40, borderRadius: 15 }
                      ]}
                      onPress={this.onOpenAutocompletePress}
                    >
                      <View style={{ flexDirection: "row" }}>
                        <View style={{ justifyContent: "center", padding: 5 }}>
                          <Icon name="magnifier" size={15} />
                        </View>
                        <Text style={{ color: "#70818A", padding: 5 }}>
                          Search for places
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                  <View
                    style={{
                      width: "25%",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <TouchableOpacity
                      style={[
                        styles.button,
                        {
                          width: 80,
                          height: 80,
                          backgroundColor: "#F3F7F9",
                          borderRadius: 80 / 2
                        }
                      ]}
                      onPress={this.onOpenPickerPress}
                    >
                      <Icon name="map" size={20} />
                    </TouchableOpacity>
                  </View>
                </View>
                {/* Topbar Search and Map Button Ends */}
                <View style={styles.LineBorder} />
                <View style={{ height: "87%" }}>
                  <ScrollView
                    refreshControl={
                      <RefreshControl
                        refreshing={this.state.refreshing}
                        onRefresh={this._onRefresh}
                        title="Loading..."
                      />
                    }
                  >
                    {/* Image Section  Starts*/}
                    <View
                      style={
                        this.state.photoPresent == true
                          ? { height: 300, backgroundColor: "#fff" }
                          : { height: 0 }
                      }
                    >
                      {PlacePhoto}
                    </View>
                    {/* Image Section  Ends*/}
                    {/* Place Name Section */}

                    <View style={styles.NameHeader}>
                      <View style={{ alignItems: "flex-end" }}>
                        <View
                          style={{
                            backgroundColor: "#4CAF50",
                            height: 25,
                            width: 50,
                            borderRadius: 50 / 2,
                            paddingHorizontal: 10,
                            alignItems: "center",
                            flexDirection: "row",
                            justifyContent: "space-evenly"
                          }}
                        >
                          <Icon color="#fff" name="star" />

                          <Text style={{ color: "#fff", fontWeight: "bold" }}>
                            {this.getRatings(placeDetail.rating)}
                          </Text>
                        </View>
                      </View>
                      <Text
                        style={{
                          color: "black",
                          fontSize: 20,
                          fontWeight: "bold"
                        }}
                      >
                        {placeDetail.name}
                      </Text>
                      <View style={{ flexDirection: "row" }}>
                        <View style={{ width: "5%" }}>
                          <Icon name="location-pin" />
                        </View>
                        <View style={{ width: "95%" }}>
                          <Text style={{ fontWeight: "bold" }}>
                            {this.getTypes(placeDetail.types)}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.LineBorder} />

                    {/* Place Name Section */}
                    {/* Place Address Section */}

                    <View style={styles.addressBar}>
                      <View
                        style={{ paddingVertical: 10, paddingHorizontal: 15 }}
                      >
                        <Text style={{ color: "black", fontWeight: "bold" }}>
                          ADDRESS
                        </Text>
                      </View>
                      <View style={{ height: 1, backgroundColor: "#EDEEF3" }} />
                      <View
                        style={{ paddingHorizontal: 15, paddingVertical: 5 }}
                      >
                        <Text style={{ color: "black" }}>
                          {placeDetail.address}
                        </Text>
                      </View>
                      {this.getPhoneWeb(
                        placeDetail.phoneNumber,
                        placeDetail.website
                      )}
                    </View>
                    {/* Place Address Section Ends*/}
                    <View style={{ height: 1, backgroundColor: "#EDEEF3" }} />

                    <View style={styles.addressBar}>
                      <View
                        style={{ paddingVertical: 10, paddingHorizontal: 15 }}
                      >
                        <Text style={{ color: "black", fontWeight: "bold" }}>
                          REVIEWS
                        </Text>
                      </View>
                    </View>
                    <View style={{ height: 1, backgroundColor: "#EDEEF3" }} />

                    <View style={{ paddingBottom: 20 }}>{QuestionsFetch}</View>
                  </ScrollView>
                </View>
              </View>
            )}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  LineBorder: {
    height: 4
  },
  NameHeader: {
    paddingTop: 5,
    backgroundColor: "#fff",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingBottom: 5
  },
  addressBar: {
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
  },
  IconContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    justifyContent: "flex-start"
  },
  container: {
    flex: 1,
    backgroundColor: "#EDEEF3"
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
    height: 35,
    justifyContent: "center",
    paddingLeft: 10,
    marginBottom: 16
  },
  inputLauncher2: {
    backgroundColor: "#222222",
    width: "100%",
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
