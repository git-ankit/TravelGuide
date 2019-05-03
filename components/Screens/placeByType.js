import React, { Component } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Linking
} from "react-native";
import RNGooglePlaces from "react-native-google-places";
export default class PlaceByType extends Component {
  constructor(props) {
    super(props);
    this.state = {
      LocationActive: false,
      Result: null
    };
  }

  searchByType = placeType => {
    // Search Places by type function
    navigator.geolocation.getCurrentPosition(position => {
      console.log(position.coords.latitude);
      RNGooglePlaces.getCurrentPlace()
        .then(results => {
          ResLen = results.length;
          NewRes = [];
          for (i = 0; i < ResLen; i++) {
            typeLen = results[i].types.length;
            for (j = 0; j < typeLen; j++) {
              if (results[i].types[j] == placeType) {
                NewRes.push(results[i]);
              }
            }
          }
          if (NewRes.length == 0) {
            NewRes.push({
              name: "Oops, no nearby place found",
              address: null,
              placeID: 1
            });
          }
          this.setState({ LocationActive: true, Result: NewRes });

          console.log(NewRes);
        })
        .catch(error => console.log(error.message));
    });
  };

  render() {
    LocationList = null;
    if (this.state.LocationActive == true) {
      LocationList = (
        <FlatList // Flatlist to render places
          data={this.state.Result}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                Linking.openURL(
                  "google.navigation:q=" + item.latitude + "+" + item.longitude
                )
              }
            >
              <View elevation={1} style={styles.itemContainer}>
                <Text
                  style={{ fontSize: 20, fontWeight: "bold", color: "black" }}
                >
                  {item.name}
                </Text>
                <View style={{ height: 1, backgroundColor: "#9E9E9E" }} />
                <Text>{item.address}</Text>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={i => i.placeID}
        />
      );
    }

    return (
      <View style={styles.container}>
        <View style={{ paddingBottom: 10, padding: 20 }}>
          <Text
            style={{ fontWeight: "bold", fontSize: 20, textAlign: "center" }}
          >
            Search Nearby Places
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            paddingBottom: 10,
            justifyContent: "center"
          }}
        >
          <TouchableOpacity
            style={{ paddingHorizontal: 5 }}
            onPress={() => this.searchByType("store")}
          >
            <View style={{ backgroundColor: "#8BC34A", borderRadius: 20 }}>
              <Text
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  color: "#fff"
                }}
              >
                Store
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ paddingHorizontal: 5 }}
            onPress={() => this.searchByType("restaurant")}
          >
            <View style={{ backgroundColor: "#03A9F4", borderRadius: 20 }}>
              <Text
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  color: "#fff"
                }}
              >
                Restaurant
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ paddingHorizontal: 5 }}
            onPress={() => this.searchByType("health")}
          >
            <View style={{ backgroundColor: "#F44336", borderRadius: 20 }}>
              <Text
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  color: "#fff"
                }}
              >
                Health
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ paddingHorizontal: 5 }}
            onPress={() => this.searchByType("hindu_temple")}
          >
            <View style={{ backgroundColor: "#FFEB3B", borderRadius: 20 }}>
              <Text
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  color: "black"
                }}
              >
                Temple
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "center" }}>
          <TouchableOpacity
            style={{ paddingHorizontal: 5 }}
            onPress={() => this.searchByType("shopping_mall")}
          >
            <View style={{ backgroundColor: "#009688", borderRadius: 20 }}>
              <Text
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  color: "#fff"
                }}
              >
                Shopping Mall
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ paddingHorizontal: 5 }}
            onPress={() => this.searchByType("travel_agency")}
          >
            <View style={{ backgroundColor: "#4CAF50", borderRadius: 20 }}>
              <Text
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  color: "#fff"
                }}
              >
                Travel Agency
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ paddingHorizontal: 5 }}
            onPress={() => this.searchByType("university")}
          >
            <View style={{ backgroundColor: "#3F51B5", borderRadius: 20 }}>
              <Text
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  color: "#fff"
                }}
              >
                University
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        <ScrollView>
          <View style={{ paddingTop: 20 }}>{LocationList}</View>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  itemContainer: {
    backgroundColor: "#fff",
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 5,
    marginTop: 5,
    borderRadius: 2,
    padding: 5,
    shadowOffset: { width: 10, height: 10 },
    shadowColor: "black",
    shadowOpacity: 1.0,
    justifyContent: "center"
  }
});
