import React, { Component } from "react";
import { Text, View, TouchableOpacity } from "react-native";
import {TextInput, Button, TouchableRipple} from "react-native-paper"
import firebase from "react-native-firebase";
export default class App extends Component {
    constructor(props){
        super(props);
        this.state={
            selectedPlace: this.props.navigation.getParam("place",null),// place that was selected in the last page
            question: this.props.navigation.getParam("question",null),// question from the last page
            user: this.props.navigation.getParam("user",null),// the current user email
            answer: '', // state to hold the value of the textinput to answer the question
            answers:[], // an array to display the list of answers
            loading: false
        }
        questionDoc =  `Questions/`+this.state.question.questionID+`/Answers`;//path to collection of answers inside a collection of question
        this.ref = firebase.firestore().collection(questionDoc);
        this.ref.onSnapshot(this.onCollectionUpdate);
    }

    onCollectionUpdate = querySnapshot => {
        if (querySnapshot.empty) {
          this.setState({
            answers: [{question: "No one has ever answered this question, yet. Be the first one!"}] // No answers yet
          });
        }
        else{
          const answers = [];
          querySnapshot.forEach(doc => {
            const { answer, answered_by } = doc.data();
            answers.push({
              AnswerID: doc.id,        
              answer,
              answered_by
            });
            this.setState({
              answers: answers
            });       
          }); 
        }       
      };    

    
    postAnswer = () =>{
        this.setState({ loading: true });
        var data = {
          answer: this.state.answer,
          answered_by: this.state.user
        };
        this.ref
          .add(data)
          .then(this.setState({ loading: false, answer: '' }));
      };
    render() {
        return(
            <View>
                <Text>Place:{this.state.selectedPlace.name}</Text>
                <Text>Question:{this.state.question.question}</Text>
                {/* <Text>{this.state.userID}</Text> */}
                <TextInput
                    label = "Know the answer?"
                    placeholder = "Shoot away!"
                    value= {this.state.answer}
                    onChangeText={answer => this.setState({ answer })}  
                />
                <Button
                    onPress={() => this.postAnswer()}
                    loading= {this.state.loading}
                >
                    <Text>Post my answer</Text>
                </Button>
                <Text>Look at some of the answers, other people have given</Text>
                {
                    this.state.answers.map(function (name, index) {
                        console.log(name)
                        return (
                          <View>
                            <TouchableOpacity>
                              <Text style={{ textAlign: 'center', fontWeight: "bold" }} key={index}>{name.answer}</Text>
                            </TouchableOpacity>
                          </View>
                        )
                    })
                }
            </View>
        );
    }
}
