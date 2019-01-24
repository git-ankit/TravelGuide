import React from "react";
import { StyleSheet, Text, View } from "react-native";
import RNGooglePlaces from "react-native-google-places";

export default class LocationFetch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      LocationDetailInfo: [{ name: "" }, { name: "Bye" }]
    };
  }

  async componentDidMount() {
    this.getLocation();

    RNGooglePlaces.getCurrentPlace()
      .then(results => {
        this.setState({
          LocationDetailInfo: results
        });
      })
      .catch(error => console.log(error.message));
  }

  getLocation = () => {
    navigator.geolocation.getCurrentPosition(position => {
      (global.currentLatitude = position.coords.latitude),
        (global.currentLongitude = position.coords.longitude);
    });
  };

  render() {
    LocationInfo = this.state.LocationDetailInfo;

    return (
      <View style={styles.container}>
        <Text>{LocationInfo[0].name}</Text>
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
