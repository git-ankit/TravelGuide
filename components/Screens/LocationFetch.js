import React, { Component } from "react";
import {
  Platform,
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
import RNGooglePlaces from "react-native-google-places";
import { TextInput, Button } from "react-native-paper"
import { confidenceSort } from "../Sorts/ConfidenceSort"

export default class LocationFetch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showInput: false,
      addressQuery: "",
      predictions: [],
      selectedPlace: [],// to hold the value of the selected place, quite self explanatory
      questions: [],// array to hold all the questions and the id of who asked them, about a particular place
      question: '',// state for textinput to ask a question
      loading: false,// for when we submit a question
      user: null,// a state to hold the value of current user email
      user_email: null
    };
    this.user = firebase.firestore().collection("Users")
    this.ref = firebase.firestore().collection("Questions")
  }

  componentDidMount() {
    this.unsubscribe = firebase.auth().onAuthStateChanged(user => {
      this.setState({ user: user.email });
      this.getNameByEmail(user.email);
    });

  }
  getNameByEmail = (email) => {
    console.log('in here')
    this.user.where('email', '==', email).get()
      .then(
        info = (query) => {
          query.forEach(
            doc => {
              console.log(doc.data().FullName + 'in hereat')
              this.setState({ user_email: doc.data().FullName });
            }
          )

        }
      )
  }


  getQuestions = (place) => {
    this.ref.where("place_id", "==", place.placeID).orderBy("confidence_sort", "desc").onSnapshot(this.onCollectionUpdate);// match the place_id and get questions about that place
  }

  onCollectionUpdate = querySnapshot => {
    if (querySnapshot.empty) {
      this.setState({
        questions: [{ question: "" }]//for if there are no questions
      });
    }
    else {
      const questions = [];
      querySnapshot.forEach(doc => {

        const { question, upvote, downvote, asked_by, asked_by_name } = doc.data();

        questions.push({
          questionID: doc.id,//name of the doc pertaining that question        
          question, //the question
          upvote,
          downvote,
          asked_by,
          asked_by_name
        })

        this.setState({
          questions: questions // we push the entire data, each time, after each iteration as appending a state-array can lead to race conditions due to its asynchronous nature 
        });
      });
    }
  };

  onShowInputPress = () => {
    console.log("show input");
    this.setState({ showInput: true });
  };

  onOpenPickerPress = () => {
    console.log("picker");
    RNGooglePlaces.openPlacePickerModal()
      .then(place => {
        this.setState({
          selectedPlace: place,
          questions: []
        });
        this.getQuestions(place);// As soon as we select the place, load the questions
        console.log(place)
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
        this.getQuestions(place);// As soon as we select the place, load the questions 
      })
      .catch(error => console.log(error.message));
  };

  onQueryChange = text => {
    this.setState({ addressQuery: text });
    RNGooglePlaces.getAutocompletePredictions(this.state.addressQuery, {
      country: "NG"
    })
      .then(places => {
        console.log(places);
        this.setState({ predictions: places });
      })
      .catch(error => console.log(error.message));
  };

  onSelectSuggestion(placeID) {
    console.log(placeID);
    // getPlaceByID call here
    RNGooglePlaces.lookUpPlaceByID(placeID)
      .then(results => console.log(results))
      .catch(error => console.log(error.message));

    this.setState({
      showInput: false,
      predictions: []
    });
  }

  onGetCurrentPlacePress = () => {
    RNGooglePlaces.getCurrentPlace()
      .then(results => console.log(results))
      .catch(error => console.log(error.message));
  };

  onGetPlaceByIDPress = () => {
    RNGooglePlaces.lookUpPlaceByID("ChIJhRTXUeeROxARmk_Rp3PtIvI")
      .then(results => console.log(results))
      .catch(error => console.log(error.message));
  };

  onGetPlacesByIDsPress = () => {
    RNGooglePlaces.lookUpPlacesByIDs([
      "ChIJhRTXUeeROxARmk_Rp3PtIvI",
      "ChIJy8Ny34yROxARPH21hx0a1gU",
      "EiZNdXJ0YWxhIE11aGFtbWVkIERyaXZlLCBMYWdvcywgTmlnZXJpYQ"
    ])
      .then(results => console.log(results))
      .catch(error => console.log(error.message));
  };

  upvote = (docID, upvotes, downvotes) => {
    this.setState({ loading: true })
    this.ref.doc(docID)
      .get()
      .then(update = (querySnapshot) => {
        if (querySnapshot.exists) {
          this.ref.doc(docID).collection('upvotedBy').where('userID', '==', this.state.user).get()
            .then(
              searchInUpvotes = (query_for_upvote) => {
                if (!query_for_upvote.empty) {
                  Alert.alert("You have already upvoted this!");
                }
                else {
                  this.ref.doc(docID).collection('downvotedBy').where('userID', '==', this.state.user).get()
                    .then(
                      searchInDownvotes = (query_for_downvote) => {
                        if (!query_for_downvote.empty) {
                          query_for_downvote.forEach(
                            doc => doc.ref.delete()
                          )
                          this.ref.doc(docID).collection('upvotedBy').add({ userID: this.state.user })
                          this.ref.doc(docID).update({ upvote: upvotes + 1, downvote: downvotes - 1 })
                          this.ref.doc(docID).update({ confidence_sort: confidenceSort(upvotes + 1, upvotes + downvotes) })
                        }
                        else {
                          this.ref.doc(docID).collection('upvotedBy').add({ userID: this.state.user })
                          this.ref.doc(docID).update({ upvote: upvotes + 1 })
                          this.ref.doc(docID).update({ confidence_sort: confidenceSort(upvotes + 1, upvotes + downvotes + 1) })
                        }
                      }
                    )
                }
              }
            )
        }
        else {
          Alert.alert("Something went wrong")
        }
      })
      .then(this.setState({ loading: false }))

  }

  downvote = (docID, upvotes, downvotes) => {
    this.setState({ loading: true });
    this.ref.doc(docID)
      .get()
      .then(update = (querySnapshot) => {
        if (querySnapshot.exists) {
          this.ref.doc(docID).collection('downvotedBy').where('userID', '==', this.state.user).get()
            .then(
              searchInDownvotes = (query_for_upvote) => {
                if (!query_for_upvote.empty) {
                  Alert.alert("You have already downvoted this!");
                }
                else {
                  this.ref.doc(docID).collection('upvotedBy').where('userID', '==', this.state.user).get()
                    .then(
                      searchInUpvotes = (query_for_upvote) => {
                        if (!query_for_upvote.empty) {
                          query_for_upvote.forEach(
                            doc => doc.ref.delete()
                          )
                          this.ref.doc(docID).collection('downvotedBy').add({ userID: this.state.user })
                          this.ref.doc(docID).update({ downvote: downvotes + 1, upvote: upvotes - 1 })
                          this.ref.doc(docID).update({ confidence_sort: confidenceSort(upvotes - 1, upvotes + downvotes) })
                        }
                        else {
                          this.ref.doc(docID).collection('downvotedBy').add({ userID: this.state.user })
                          this.ref.doc(docID).update({ downvote: downvotes + 1 })
                          this.ref.doc(docID).update({ confidence_sort: confidenceSort(upvotes, upvotes + downvotes + 1) })
                        }
                      }
                    )
                }
              }
            )
        }
        else {
          Alert.alert("Something went wrong")
        }
      })
    this.setState({ loading: false });
  }


  postQuestion = () => {
    this.setState({ loading: true });
    var data = {
      question: this.state.question,
      asked_by: this.state.user,
      place_id: this.state.selectedPlace.placeID,
      upvote: 0,
      downvote: 0,
      asked_by_name: this.state.user_email
    };
    this.ref
      .add(data)
      .then(this.setState({ loading: false, question: '' }))
      .then(docRef => {
        this.upvote(docRef.id, 0, 0)
      })
      .catch(error => console.error("Error adding document: ", error))

  };// a question's collection will have the fields-the question, the asker's user id and the selected place id. Also, a collection of answers
  keyExtractor = item => item.placeID;

  renderItem = ({ item }) => {
    return (
      <View style={styles.listItemWrapper}>
        <TouchableOpacity
          style={styles.listItem}
          onPress={() => this.onSelectSuggestion(item.placeID)}
        >

          <View style={styles.placeMeta}>
            <Text style={styles.primaryText}>{item.primaryText}</Text>
            <Text style={styles.secondaryText}>{item.secondaryText}</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.divider} />
      </View>
    );
  };

  render() {
    placeDetail = this.state.selectedPlace;
    navigation = this.props.navigation
    user = this.state.user
    return (
      <View style={styles.container}>
        {this.state.showInput && (
          <View>
            <View style={styles.inputWrapper}>
              <TextInput
                ref={input => (this.pickUpInput = input)}
                style={styles.input}
                value={this.props.addressQuery}
                onChangeText={this.onQueryChange}
                placeholder={"Current Location"}
                placeholderTextColor="#9BABB4"
                underlineColorAndroid={"transparent"}
                autoFocus
              />
            </View>

            <View style={styles.list}>
              <FlatList
                data={this.state.predictions}
                renderItem={this.renderItem}
                keyExtractor={this.keyExtractor}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ flexGrow: 1 }}
              />
            </View>
          </View>
        )}

        {!this.state.showInput && (
          <View>

            <View>
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity
                  style={[styles.inputLauncher, { width: "80%", height: 40 }]}
                  onPress={this.onOpenAutocompletePress}
                >
                  <Text style={{ color: "#70818A" }}>Where to?</Text>
                </TouchableOpacity>
                {/* <TouchableOpacity
                  style={styles.inputLauncher}
                  onPress={this.onShowInputPress}
                >
                  <Text style={{ color: "#70818A" }}>Where to?</Text>
                </TouchableOpacity> */}
                {/* <TouchableOpacity
                  style={styles.button}
                  onPress={this.onOpenAutocompletePress}
                >
                  <Text style={styles.buttonText}>Search</Text>
                </TouchableOpacity> */}
                <TouchableOpacity
                  style={[styles.button, { width: "20%", height: 40, backgroundColor: "#F3F7F9" }]}
                  onPress={this.onOpenPickerPress}
                >
                  <Icon name='map' />
                </TouchableOpacity>
              </View>

              {
                placeDetail.name && (//Only be visible when a place is selected
                  <View>
                    <View
                      elevation={3}
                      style={[styles.shadowContainer]}
                    >
                      <Text style={{ color: "black", textAlign: 'center' }}>{placeDetail.name}</Text>
                      <Text style={{ textAlign: 'center' }}>At</Text>
                      <Text style={{ color: "black", textAlign: 'center' }}>{placeDetail.address}</Text>
                      {/* <Text style={{ color: "red" }}>{placeDetail.phoneNumber}</Text>
                      <Text style={{ color: "red" }}>{placeDetail.website}</Text> */}
                    </View>
                    <View>

                      <ScrollView>
                        {
                          this.state.questions.map(iterate = (name, index) => {// Iterate the questions
                            if (name.question == '') {
                              return (
                                <View>

                                  <View
                                    elevation={3}
                                    style={[styles.shadowContainer, { padding: 5 }]}
                                  >
                                    <Text style={{ textAlign: 'center', fontWeight: "bold" }}>Oh my, the comments are so empty!</Text>
                                  </View>

                                </View>
                              )
                            }
                            else {

                              return (

                                <TouchableOpacity
                                  onPress={() => { navigation.navigate("AnswersScreen", { place: placeDetail, question: name, user: user }) }}
                                >
                                  <View
                                    elevation={3}
                                    style={[styles.shadowContainer, { padding: 5 }]}
                                  >
                                    <Text style={{ textAlign: 'left', fontSize: 10 }} key={index}>u/{name.asked_by_name}</Text>
                                    <Text style={{ textAlign: 'left', color: 'black' }}>{name.question}</Text>
                                    <View style={styles.IconContainer}>
                                      <Button
                                        onPress={() => this.upvote(name.questionID, name.upvote, name.downvote)}
                                        icon="thumb-up"
                                        compact
                                      >
                                        <Text>{name.upvote}</Text>
                                      </Button>
                                      <Button
                                        onPress={() => this.downvote(name.questionID, name.upvote, name.downvote)}
                                        icon="thumb-down"
                                        compact
                                      >
                                        <Text>{name.downvote}</Text>
                                      </Button>
                                    </View>
                                  </View>
                                </TouchableOpacity>

                              )
                            }
                          })
                        }
                      </ScrollView>

                    </View>
                  </View>


                )
              }
              {/* 
            <TouchableOpacity
              style={styles.button}
              onPress={this.onGetCurrentPlacePress}
            >
              <Text style={styles.buttonText}>
                Get Current Place (not on Android Emulators)
              </Text>
            </TouchableOpacity> */}

              {/* <TouchableOpacity
              style={styles.button}
              onPress={this.onGetPlaceByIDPress}
            >
              <Text style={styles.buttonText}>Get Place By ID</Text>
            </TouchableOpacity> */}

              {/* <TouchableOpacity
              style={styles.button}
              onPress={this.onGetPlacesByIDsPress}
            >
              <Text style={styles.buttonText}>Get Places By IDs (New)</Text>
            </TouchableOpacity> */}
            </View>

          </View>
        )}
        {
          placeDetail.name && (
            <View style={{ flexDirection: 'row', position: 'absolute', bottom: 0 }}>
              <TextInput
                label="Have an opinion about this place?"
                placeholder="Shoot away!"
                value={this.state.question}
                onChangeText={question => this.setState({ question })}
                style={{ width: "80%", backgroundColor: "#F3F7F9" }}
              />
              <Button
                onPress={() => this.postQuestion()}
                loading={this.state.loading}
                style={{ width: "20%", backgroundColor: "#F3F7F9" }}
                compact
                icon="send"
              >
              </Button>
            </View>
          )
        }
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
    flexDirection: 'row',
    backgroundColor: "#fff",
    justifyContent: 'flex-start',
    width: "100%",
    flexWrap: 'wrap'
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