/* eslint-disable promise/no-nesting */
/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
/* eslint-disable no-alert */
import firebase from '../../../base';
import React from 'react';
import { View } from 'react-native';
import 'firebase/firestore';
import 'firebase/storage';

import { cancelEditProfile } from './cancelEditProfile';
import { checkEmail, user } from './checkEmail';
import { submitDriverDetails } from './submitDriverDetails';
import { submitEditProfile } from './submitEditProfile';
import { submitPassword } from './submitPassword';
import { cancelPassword } from './cancelPassword';
import { checkDriverApplicationStatus } from './checkDriverApplicationStatus';
const util = require('./util')
import '../../constants/custom.css';

class Account extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleImgChange = this.handleImgChange.bind(this);
    this.editProfile = this.editProfile.bind(this);
    this.logout = this.logout.bind(this);
    this.state = {
      firstName: '',
      lastName: '',
      username: '',
      phone: '',
      email: '',
      newPassword: '',
      confirmPassword: '',
      isDriver: '',
      isAdmin: '',
      isBanned: '',
      wallet: '',
      id: '',
      rating: '',
      ratedBy: '',
      avgRating: 0.00,
      image: null,
      frontURL: '',
      backURL: '',
      progress: 0,
      license: '',
      carplate: '',
      status: '',
      dateApplied: ''
    };
  }

  // handles textbox change
  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value
    });
  }

  handleImgChange = (e) => {
      if (e.target.files[0]) {
          const image = e.target.files[0];
          this.setState(() => ({
              image
          }));
      }
  }

  componentDidUpdate(prevState) {
    // Typical usage (don't forget to compare props):
    if (this.state.firstName !== prevState.firstName) {
      this.render();
    }
  }

  // goes back to login page if stumble upon another page by accident without logging in
  componentDidMount() {
    checkEmail();

    this.setState({
      firstName: user[0],
      lastName: user[1],
      username: user[2],
      email: user[3],
      phone: user[4],
      isDriver: user[5],
      isAdmin: user[6],
      isBanned: user[7],
      wallet: user[8],
      id: user[9],
      rating: user[10],
      ratedBy: user[11]
    }, (() => {
        if (this.state.ratedBy > 0) {
          const avg = parseFloat(this.state.rating) / parseInt(this.state.ratedBy).toFixed(2);
          this.setState({ avgRating: avg });
        }
    }));
  }

  editProfile = () => {
    util.editProfile();
    document.getElementById('tblApplyDriver').style.display = 'none';
    document.getElementById('btnApplyDriver').style.display = 'none';
    document.getElementById('cancelApplyDriverButton').style.display = 'none';
    document.getElementById('btnImgFrontUpload').style.display = 'none';
    document.getElementById('btnImgBackUpload').style.display = 'none';
    document.getElementById('submitDriverDetails').style.display = 'none';
  }

  submitEditProfile_Click = () => {
    submitEditProfile(this.state.firstName, this.state.lastName, this.state.phone);
  }

  submitPassword_Click = () => {
    submitPassword(this.state.newPassword, this.state.confirmPassword);

    this.setState({
      newPassword: '',
      confirmPassword: ''
    });
  }

  submitDriverDetails_Click = () => {
    submitDriverDetails(this.state.license, this.state.carplate);
    this.state = {
      carplate: '',
      license: '',
      status: '',
      dateApplied: ''
    };
  }

  // uplaods front license pic
  handleUploadFront = () => {
    document.getElementById('cancelApplyDriverButton').disabled = true;
    const { image } = this.state;
    if (document.getElementById('file').value !== '') {
      const uploadTask = firebase.storage().ref().child(`license/${user[9]}/front`).put(image);
      uploadTask.on(
        "state_changed",
        snapshot => {
          // progress function ...
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          this.setState({
            progress
          });
          console.log('Upload is ' + progress + '% done');
        },
        error => {
          // Error function ...
          alert('Error: ' + error);
          console.log(error);
        }, () => {
          // complete function ...
          alert('Image is uploaded!');
          document.getElementById('cancelApplyDriverButton').disabled = false;
          document.getElementById('btnImgFrontUpload').style.display = 'none';
          document.getElementById('btnImgBackUpload').style.display = 'inline-block';
          document.getElementById('td_license').innerHTML = 'License Back:';
          document.getElementById('file').value = "";
          firebase.storage()
            .ref("license/" + user[9])
            .child("front")
            .getDownloadURL()
            .then(frontURL => {
              this.setState({
                frontURL
              });
            });
        });
    } else {
      alert('Error: No file selected');
      document.getElementById('cancelApplyDriverButton').disabled = false;
    }
  }

  // uploads back license pic
  handleUploadBack = () => {
    document.getElementById('cancelApplyDriverButton').disabled = true;
    var date = new Date;
    var m = date.getMonth();
    var d = date.getDate();
    var y = date.getFullYear();
    var today = new Date(y, m, d);

    const { image } = this.state;
    if (document.getElementById('file').value !== '') {
      const uploadTask = firebase.storage().ref().child(`license/${user[9]}/back`).put(image);
      uploadTask.on(
        "state_changed",
        snapshot => {
          // progress function ...
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          this.setState({
            progress
          });
          console.log('Upload is ' + progress + '% done');
        },
        error => {
          // Error function ...
          console.log(error);
        }, () => {
          // complete function ...
          document.getElementById('cancelApplyDriverButton').disabled = false;
          alert('Image is uploaded!')
          firebase.storage()
            .ref("license/" + user[9])
            .child("back")
            .getDownloadURL()
            .then(backURL => {
              this.setState({
                backURL
              });
            });

          const accountsRef = firebase.database().ref('driverDetails/' + user[9]);
          const driverDetails = {
            completed: "yes",
            dateApplied: today.toDateString()
          }

          accountsRef.update(driverDetails);
          alert('Your application has been submitted!');
          util.profilePageReset();
          util.cancelApplyDriver();
          checkDriverApplicationStatus();
        });
    } else {
      alert('Error: No file selected');
      document.getElementById('cancelApplyDriverButton').disabled = false;
    }
  }

  logout = () => {
      user[0] = '';
      user[1] = '';
      user[2] = '';
      user[3] = '';
      user[4] = '';
      user[5] = '';
      user[6] = '';
      user[7] = '';
      user[8] = '';
      user[9] = '';
      user[10] = '';
      user[11] = '';

      firebase.auth().signOut();
  }

render() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <div id='acctPage'>
        <div>
          <h1>{this.state.username + "'s Account"}</h1>
          <table id='tblProfile'>
            <tbody>
              <tr>
                <td>First Name:</td>
                <td>
                  <label id='lblfName' style={{display:'inline'}}>{this.state.firstName}</label>
                  <input id='editfName' style={{display:'none'}} placeholder={this.state.firstName} value={this.state.firstName}
                    onChange={this.handleChange} type="text" name="firstName" />
                </td>
              </tr>
              <tr>
                <td>Last Name:</td>
                <td>
                  <label id='lbllName' style={{display:'inline'}}>{this.state.lastName}</label>
                  <input id='editlName' style={{display:'none'}} placeholder={this.state.lastName} value={this.state.lastName}
                    onChange={this.handleChange} type="text" name="lastName" />
                </td>
              </tr>
              <tr>
                <td>Email:</td>
                <td>
                  <label id='lblEmail' style={{display:'inline'}} name='email'>{this.state.email}</label>
                </td>
              </tr>
              <tr>
                <td>Phone:</td>
                <td>
                  <label id='lblPhone' style={{display:'inline'}}>{user[4]}</label>
                  <input id='editPhone' style={{display:'none'}} placeholder={this.state.phone} value={this.state.phone}
                   onChange={this.handleChange} type="phone" name="phone" />
                </td>
              </tr>
              <tr>
                <td>Driver :</td>
                <td>
                  <label id='lblDriver' name='isDriver'>{this.state.isDriver}</label>
                </td>
              </tr>
              <tr>
                <td>Rating:</td>
                <td>
                  <label id='lblRating' name='rating'>{parseFloat(this.state.avgRating).toFixed(2)}</label>
                </td>
              </tr>
            </tbody>
          </table>
          <table id='tblPassword' style={{display: 'none'}}>
            <tbody>
              <tr>
                <td>New Password:</td>
                <td><input id='editNewPassword' value={this.state.newPassword} onChange={this.handleChange}
                    type="password" name="newPassword" /></td>
              </tr>
              <tr>
                <td>Confirm Password:</td>
                <td><input id='editConfirmPassword' value={this.state.confirmPassword} onChange={this.handleChange}
                    type="password" name="confirmPassword" /></td>
              </tr>
            </tbody>
          </table>

          <div id="tblApplyDriver" style={{display: 'none'}}>
            <div>
              <table id='tblDriverDetails'>
                <tbody>
                  <tr>
                    <td>Carplate No:</td>
                    <td>
                      <input id='txtCarplate' value={this.state.carplate} onChange={this.handleChange} type="text"
                        name="carplate" />
                    </td>
                  </tr>
                  <tr>
                    <td>Issue Date:</td>
                    <td>
                      <input id='txtIssueDate' type="date" name="date" />
                    </td>
                  </tr>
                  <tr>
                    <td>License Number:</td>
                    <td>
                      <input id='txtLicenseNo' value={this.state.license} onChange={this.handleChange} type="text"
                        name="license" />
                    </td>
                  </tr>
                </tbody>
              </table>

              <div id='tblDriverImage' style={{display: 'none'}}>
                <table>
                  <tbody>
                    <tr id='uploadedFront'>
                      <td>
                        {this.state.frontURL && <img src={this.state.frontURL} height='150' width='200' />}
                      </td>
                      <td>
                        {this.state.backURL && <img src={this.state.backURL} height='150' width='200' />}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <table>
                  <tbody>
                    <tr>
                      <td id='td_license'>License Front:</td>
                      <td><input type="file" id='file' accept="image/*" onChange={this.handleImgChange} /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <br />
          <br />
          <button id='submitDriverDetails' onClick={this.submitDriverDetails_Click} style={{display:'none'}}>Continue</button>
          <button id='btnImgFrontUpload' onClick={this.handleUploadFront} style={{display:'none'}}>Upload Front</button>
          <button id='btnImgBackUpload' onClick={this.handleUploadBack} style={{display:'none'}}>Upload Back</button>
          <button id='cancelApplyDriverButton' onClick={util.cancelApplyDriver} style={{display:'none'}}>Cancel</button>
          <button id='editButton' onClick={this.editProfile}>Edit Profile</button>
          <button id='changePasswordButton' onClick={util.changePassword}>Change Password</button>
          <button id='submitEditButton' onClick={this.submitEditProfile_Click} style={{display:'none'}}>Update</button>
          <button id='cancelEditButton' onClick={cancelEditProfile} style={{display:'none'}}>Cancel</button>
          <button id='submitPasswordButton' onClick={this.submitPassword_Click} style={{display:'none'}}>Update</button>
          <button id='cancelPasswordButton' onClick={cancelPassword} style={{display:'none'}}>Cancel</button>
          <div>
            <button id='btnApplyDriver' onClick={util.applyDriver} style={{display:'none'}}>Apply to be a driver</button>
          </div>
          <br />
          <button onClick={this.logout}>Logout</button>
        </div>
      </div>
    </View>
    );
  }
}

export default Account;