import React, { Component } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions
} from "react-native";
import firebase from "react-native-firebase";
import RNGooglePlaces from "react-native-google-places";
import {TextInput, Button} from "react-native-paper"

export default class LocationFetch extends Component{
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
      user: null,// a state to hold the value of current user id
    };
    this.user = firebase.firestore().collection("Users")
    this.ref = firebase.firestore().collection("Questions")
  }
  componentDidMount() {
    this.unsubscribe = firebase.auth().onAuthStateChanged(user => {
      this.setState({ user: user.uid});
    });
  }

  getQuestions = (place) =>{
    this.ref.where("place_id", "==", place.placeID).onSnapshot(this.onCollectionUpdate);// match the place_id and get questions about that place
  }

  onCollectionUpdate = querySnapshot => {
    if (querySnapshot.empty) {
      this.setState({
        questions: [{question: "No one has ever asked any questions, yet. Be the first one!"}]//for if there are no questions
      });
    }
    else{
      const questions = [];
      querySnapshot.forEach(doc => {
        const { question } = doc.data();
        questions.push({
          questionID: doc.id,//name of the doc pertaining that question        
          question //the question
        });
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
        console.log(place);
        this.setState({
          selectedPlace: place,
          questions: []
        });
        this.getQuestions(place);// As soon as we select the place, load the questions 
      })
      .catch(error => console.log(error.message));
  };

  onOpenAutocompletePress = () => {
    RNGooglePlaces.openAutocompleteModal()
      .then(place => {
        console.log(place);
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

  postQuestion = () =>{
    this.setState({ loading: true });
    var data = {
      question: this.state.question,
      asked_by: this.state.user,
      place_id: this.state.selectedPlace.placeID
    };
    this.ref
      .add(data)
      .then(this.setState({ loading: false, question: '' }));
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
    console.log(placeDetail);
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
            {/* <TouchableOpacity
              style={styles.inputLauncher}
              onPress={this.onShowInputPress}
            >
              <Text style={{ color: "#70818A" }}>Where to?</Text>
            </TouchableOpacity> */}
            <TouchableOpacity
              style={styles.button}
              onPress={this.onOpenAutocompletePress}
            >
              <Text style={styles.buttonText}>Search</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={this.onOpenPickerPress}
            >
              <Text style={styles.buttonText}>Open Maps</Text>
            </TouchableOpacity>

            {
              placeDetail.name && (//Only be visible when a place is selected
                <View>
                  <View
                    elevation={3}
                    style={styles.shadowContainer}
                  >
                    <Text style={{ textAlign: 'center', fontWeight: "bold" }}>Location Description</Text>
                    <Text style={{ textAlign: 'center' }}>{placeDetail.name}</Text>
                    <Text style={{ textAlign: 'center' }}>{placeDetail.address}</Text>
                    <Text style={{ textAlign: 'center' }}>{placeDetail.phoneNumber}</Text>
                    <Text style={{ textAlign: 'center' }}>{placeDetail.website}</Text>                  
                  </View>
                  <View
                    elevation={3}
                    style={styles.shadowContainer}
                  >
                    <TextInput 
                      label = "Have a question about this place?"
                      placeholder = "Shoot away!"
                      value= {this.state.question}
                      onChangeText={question => this.setState({ question })}  
                    />
                    <Button
                      onPress={() => this.postQuestion()}
                      loading= {this.state.loading}
                    >
                      <Text>Post my question</Text>
                    </Button>
                  </View>
                  <Text style={{ textAlign: 'center', fontWeight: "bold" }}>Or you can see what others have asked...</Text>

                  {
                    this.state.questions.map(function (name, index) {// Iterate the questions
                      return (
                        <TouchableOpacity
                          onPress={()=>{navigation.navigate("AnswersScreen",{place: placeDetail, question: name, user: user})}}
                        >
                        <View
                          elevation={3}
                          style={[styles.shadowContainer,{padding:5}]}
                        >
                          <Text style={{ textAlign: 'center', fontWeight: "bold" }} key={index}>{name.question}</Text>
                        </View>
                        </TouchableOpacity>
                      )
                    })
                  }
                  {console.log(this.state.questions)}

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
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  shadowContainer:{  
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