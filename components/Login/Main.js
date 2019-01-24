import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  AsyncStorage
} from "react-native";
import firebase from "react-native-firebase";

export default class Main extends React.Component {
  constructor(props) {
    super(props);
    this.ref = firebase.firestore().collection("Users");
    this.unsubscriber = null;
    this.state = {
      loading: true,
      isActive: false, // for Navigation
      user: null, // unsubscriber
      userEmail: null // To store in AsyncStorage
    };
  }

  // Getting Currer user from firebase auth
  componentDidMount() {
    this.unsubscribe = firebase.auth().onAuthStateChanged(user => {
      this.setState({ user, userEmail: user.email });
      this.getUser(user.email);
    });
  }

  // Checking User in AsyncStorage
  getUser = async firebaseEmail => {
    try {
      let activeUser = await AsyncStorage.getItem("activeUser");
      if (activeUser == firebaseEmail) {
        this.setState({ isActive: true });
        this.props.navigation.navigate(
          this.state.isActive ? "LocationFetch" : "RegisterInfo"
        );
      } else {
        this.UserInformation = this.ref.where("email", "==", firebaseEmail);
        this.UserInformation.get().then(data => this.onCollectionUpdate(data));
      }
    } catch (error) {
      this.UserInformation = this.ref.where("email", "==", firebaseEmail);
      this.UserInformation.get().then(data => this.onCollectionUpdate(data));
    }
  };

  // if not in AsyncStorage, fetching from firebase database
  onCollectionUpdate = querySnapshot => {
    querySnapshot.forEach(doc => {
      if (!doc.exists) {
      } else {
        this.setState({ isActive: true });
        AsyncStorage.setItem("activeUser", this.state.userEmail);
      }
    });
    this.props.navigation.navigate(
      this.state.isActive ? "LocationFetch" : "RegisterInfo"
    );
  };

  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>Loading</Text>
        <ActivityIndicator size="large" />
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});
