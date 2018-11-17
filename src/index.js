import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route} from "react-router-dom";
import axios from 'axios';
import ReactAudioPlayer from 'react-audio-player';
import './index.css'

var Table = require('react-bootstrap/lib/Table');
var Alert = require('react-bootstrap/lib/Alert');
var Jumbotron = require('react-bootstrap/lib/Jumbotron');
var Button = require('react-bootstrap/lib/Button');
var FormControl = require('react-bootstrap/lib/FormControl');
class OAuth extends React.Component{
    render(){
      console.log(process.env);
      const hre = "https://myvoice.lyrebird.ai/authorize?response_type=token&client_id="+process.env.REACT_APP_CLIENT_CODE+"&redirect_uri=http%3A%2F%2Flocalhost:3000%2Fauth&scope=voice&state=987654321";
        return(
            <Jumbotron>
  <h1 className="center">Hey, Buddy!</h1>
  <p className="center">
    Thank you for choosing the app.You can create the most realistic artificial voices in the world but before that please authrize yourself.
  </p>
  <p className="center">
 <a className="auth-link" href={hre}>Authorize</a>
  </p>
  </Jumbotron>
        );
    }
}

function Routing() {
  return (
    <Router>
      <div>
        <Route exact path="/" component={Generate} />
        <Route exact path="/auth" component={Auth} />
      </div>
    </Router>
  );
}

class Auth extends React.Component{
  render(){
    let tokenType = {bearer : "Bearer"};
    let tokenArray = {};
    this.props.history.push('/');
    let x = this.props.location.hash;
    this.props.location.hash = "";
    x = x.substring(1,x.length);
    var array = x.split("&");
    for(let i=0;i<array.length;i++)
    {
      let temp = array[i].split("=")
      tokenArray[temp[0]] = temp[1];
    }
    var token = tokenType[tokenArray.token_type] + " "+ tokenArray.access_token;
    localStorage.setItem('token', JSON.stringify(token));
    return(
      <p>you will be redirected soon</p>
    )
  }
}

class Generate extends React.Component{
  constructor(props) {
    super(props); 
    var x = localStorage.getItem("token") ? JSON.parse(localStorage.getItem("token")) : null;
    this.state = {value: '',token: x,refresh: '0'};
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleSubmit(event) {
    this.setState({process : '1'})
    var postData = {text :this.state.value};
    let axiosConfig = {
      headers: {
          'Content-Type': 'application/json',
          "Authorization" : this.state.token
      }
    };

    axios.post('https://avatar.lyrebird.ai/api/v0/generate', postData, axiosConfig)
    .then((res) => {
      this.setState({process : '0'})
      this.setState({refresh : '1'})
      this.setState({refresh : '0'})
      this.setState({value: ''})
      
    })
    .catch((err) => {
      console.log("AXIOS ERROR: ", err);
    })
    event.preventDefault();
  }


  render(){
    var alert;
    if(this.state.process === '1')
    {
     alert =  <Alert bsStyle="warning">
  <strong>Hey</strong> We are generating an audio for your voice please be patient.
</Alert>;
    }
    else if(this.state.process === '0')
    {
      alert =  <Alert bsStyle="success">
      <strong>Hey</strong> Audio Successfully Genrated
    </Alert>;
    }
   
    var page;
    if(!this.state.token)
    {
      page = <OAuth/>
    }
    else
    {
       
      page = <div><Jumbotron>
      <h1 className="center">Genrate Your Voice Now</h1><br/>
      <form className="center" onSubmit={this.handleSubmit}> 
      
      <FormControl
            type="text"
            value={this.state.value}
            placeholder="Enter Voice"
            onChange={this.handleChange}
          /><br/>
      <Button type="submit" bsStyle="success">Genrate</Button>
      </form>
    
      </Jumbotron>
      <Voice token = {this.state.token} refresh = {this.state.refresh}/>
      </div>
      
    }
    return(
      <div className="container"> 
      
       <Jumbotron>
  <h1 className="center">Lyrebird local avatar API</h1>

  </Jumbotron>
  {alert}
   {page}
    </div>
    )
  }
}

class Voice extends React.Component {
  constructor(props){
    super(props);
    this.state = {audios : [],refresh : '0'}
    if(this.props.token)
    {
      let axiosConfig = {
        headers: {
            'Content-Type': 'application/json',
            "Authorization" : this.props.token
        }
      };
  
      axios.get('https://avatar.lyrebird.ai/api/v0/generated', axiosConfig)
      .then((res) => {
        this.setState({audios : res.data.results})
      })
      .catch((err) => {
        console.log("AXIOS ERROR: ", err);
      })
    }

  }
    render() {
      if(this.state.refresh !== this.props.refresh)
      {
        console.log("hell")
        let axiosConfig = {
          headers: {
              'Content-Type': 'application/json',
              "Authorization" : this.props.token
          }
        };
    
        axios.get('https://avatar.lyrebird.ai/api/v0/generated', axiosConfig)
        .then((res) => {
          this.setState({audios : res.data.results})

        })
        .catch((err) => {
          console.log("AXIOS ERROR: ", err);
        })
      }
        let data = this.state.audios;
        const moves = data.map((step, move) => {
      return (
        <tr key={move}>
          <td>
            {move+1} 
          </td>
          <td>
            {step.text}
          </td>
          <td>
            {step.created_at.substring(0, 10)}
          </td>
          <td>
           <ReactAudioPlayer   src={step.url} controls/>    </td>
        </tr>
      );
    });


      return (
       <div>
          <br/>
   <h3>Your Last 10 Genrated Voices</h3>
     <br/>
        <Table responsive  >
  <thead>
    <tr>
      <th>No.</th>
      <th>Description</th>
      <th>Genration Date</th>
      <th>Play / Download / Have Fun</th>
    </tr>
  </thead>
  <tbody>
    {moves}
  </tbody>
</Table>

<br/>
<br/>
<br/>
<br/>
</div>
      );
    }
  }
ReactDOM.render(
    <Routing />,
    document.getElementById('root')
  );