/* eslint-disable no-alert */
/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */

import firebase from '../../../base';
import 'firebase/firestore';
import "firebase/storage";
import React from 'react';
import { View } from 'react-native';
import { approveApplicant } from './approveApplicant'
import { back } from './back'
import { banUser } from './banUser'
import { unBanUser } from './unBanUser'
import { checkEmailDashboard, user } from './checkEmailDashboard'

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      isMounted: false,
      frontURL: null,
      backURL: null,
      username: ''
    };
  }

  componentDidMount() {
    this.setState({ isMounted: true }, (() => {
      console.log("MOUNTED: " + this.state.isMounted);
    }));
    checkEmailDashboard();
    this.setState({ username: user[2] });
  }

  componentWillUnmount() {
    this.setState({ isMounted: false }, (() => {
      console.log("MOUNTED: " + this.state.isMounted);
    }));
  }

  getAndLoadHttpUrl = async (driverID) => {
    if (this.state.isMounted === false) {
      const fref = firebase.storage().ref("license/" + driverID).child('front');
      fref.getDownloadURL().then(data => {
        front = data;
        this.setState({ frontURL: data }, alert(this.state.frontURL));
        this.setState({ loading: false });
      }).catch(error => {
        this.setState({ frontURL: '' });
        this.setState({ loading: false });
      });

      const bref = firebase.storage().ref("license/" + driverID).child('back');
      bref.getDownloadURL().then(data => {
        this.setState({ backURL: data });
        this.setState({ loading: false });
      }).catch(error => {
        this.setState({ backURL: '' });
        this.setState({ loading: false });
      });
    }
  }

  viewApplicant = (e) => {
    var driverID = e.target.parentElement.parentElement.id;
    
    const database = firebase.database().ref('driverDetails').orderByChild('dateApplied');
    database.once('value', (snapshot) => {
      if (snapshot.exists()) {
        snapshot.forEach((data) => {
          if (data.key === driverID) {
            let driverUname = data.val().driverUname;
            let dateApplied = data.val().dateApplied;
            let license = data.val().license;
            let issuedDate = data.val().issueDate;

            document.getElementById('td_ViewApplicant_driverID').innerHTML = data.key;
            document.getElementById('td_ViewApplicant_username').innerHTML = driverUname;
            document.getElementById('td_ViewApplicant_dateApplied').innerHTML = dateApplied;
            document.getElementById('td_ViewApplicant_license').innerHTML = license;
            document.getElementById('td_ViewApplicant_issuedDate').innerHTML = issuedDate;
          }
        });
      }
    });

    firebase.storage()
      .ref("license/" + driverID)
      .child("front")
      .getDownloadURL()
      .then(frontURL => {
        this.setState({
          frontURL
        });
      }).catch(() => {
        alert('Front image could not be loaded')
      });

      

    firebase.storage()
      .ref("license/" + driverID)
      .child("back")
      .getDownloadURL()
      .then(backURL => {
        this.setState({
          backURL
        });
      }).catch(() => {
        alert('Back image could not be loaded')
      });

    console.log(this.state.isMounted);
    //this.getAndLoadHttpUrl(driverID);

    document.getElementById('div_ViewApplicant').style.display = "block";
    document.getElementById('div_ViewReportedUser').style.display = "none";
    document.getElementById('div_driverApplication').style.display = "none";
    document.getElementById('div_ReportedUsers').style.display = "none";
  }

render() {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <div id='homePage'>
          <div>
            <h1>{"Ready for a ride, " + this.state.username + "?"}</h1>
          </div>
          <div id="adminDB" style={{display: 'none'}}>
            <div id="div_driverApplication">
              <h4>Notifications</h4>
              <table>
                <tbody id="tb_AdminNotifications"></tbody>
              </table>
              <h4>Driver Applicants List</h4>
              <table>
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Date Applied</th>
                  </tr>
                </thead>
                <tbody id="tb_driverApplication">
                </tbody>
              </table>
            </div>

            <div id='div_ReportedUsers'>
              <h4>Reported User List</h4>
              <table>
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Latest Reported Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody id="tb_ReportedUsers">
                </tbody>
              </table>
            </div>

            <div id='div_ViewApplicant' style={{display: 'none'}}>
              <table id="tbl_ViewApplicant">
                <tbody>
                  <tr id='uploadedFront'>
                    <td>
                      {this.state.frontURL && <img src={this.state.frontURL} height='150' width='200' />}
                    </td>
                    <td>
                      {this.state.backURL && <img src={this.state.backURL} height='150' width='200' />}
                    </td>
                  </tr>
                  <tr>
                    <td>Driver ID:</td>
                    <td id='td_ViewApplicant_driverID'></td>
                  </tr>
                  <tr>
                    <td>Username:</td>
                    <td id='td_ViewApplicant_username'></td>
                  </tr>
                  <tr>
                    <td>Date Applied:</td>
                    <td id='td_ViewApplicant_dateApplied'></td>
                  </tr>
                  <tr>
                    <td>License no:</td>
                    <td id='td_ViewApplicant_license'></td>
                  </tr>
                  <tr>
                    <td>License Issued:</td>
                    <td id='td_ViewApplicant_issuedDate'></td>
                  </tr>
                </tbody>
              </table>
              <br />
              <button onClick={ approveApplicant }>Approve Applicant</button>
              <button onClick={ back }>Back</button>
            </div>

            <div id='div_ViewReportedUser' style={{display: 'none'}}>
              <table id="tbl_ViewReportedUser">
                <tbody>
                  <tr>
                    <td>User ID:</td>
                    <td id='td_ViewReportedUser_userID'></td>
                  </tr>
                  <tr>
                    <td>Username:</td>
                    <td id='td_ViewReportedUser_username'></td>
                  </tr>
                  <tr>
                    <td>Status:</td>
                    <td id='td_ViewReportedUser_status'></td>
                  </tr>
                  <tr>
                    <td>Last Reported Date:</td>
                    <td id='td_ViewReportedUser_lastreport'></td>
                  </tr>
                  <tr>
                    <td>No Show:</td>
                    <td id='td_ViewReportedUser_noshow'></td>
                  </tr>
                  <tr>
                    <td>Fake Profile:</td>
                    <td id='td_ViewReportedUser_fakeprofile'></td>
                  </tr>
                  <tr>
                    <td>Threatened Safety:</td>
                    <td id='td_ViewReportedUser_safety'></td>
                  </tr>
                  <tr>
                    <td>Inappropriate Behaviour:</td>
                    <td id='td_ViewReportedUser_inappropriate'></td>
                  </tr>
                  <tr>
                    <td>Uncivil, Rude or Vulgar:</td>
                    <td id='td_ViewReportedUser_vulgar'></td>
                  </tr>
                </tbody>
              </table>
              <br />
              <button id="btnBanUser" onClick={ banUser }>Ban User</button>
              <button id="btnUnBanUser" onClick={ unBanUser }>Un-Ban User</button>
              <button onClick={ back }>Back</button>
            </div>
          </div>

          <div id="driverDB" style={{display: 'none'}}>
            <div id='div_DriverNotifications'>
              <h4>Notifications</h4>
              <table>
                <tbody id="tb_DriverNotifications"></tbody>
              </table>
            </div>
            <div id='div_DriverUpcomingRides'>
              <h4>Upcoming Rides</h4>
              <table>
                <thead>
                  <tr>
                    <th>Area</th>
                    <th>Date & Time</th>
                    <th>Driver</th>
                    <th>No. of Passengers</th>
                  </tr>
                </thead>
                <tbody id="tb_DriverUpcomingRides"></tbody>
              </table>
            </div>
            <div id='div_DriverUpcomingDrives'>
              <h4>Upcoming Drives</h4>
              <table>
                <thead>
                  <tr>
                    <th>Area</th>
                    <th>Date & Time</th>
                    <th>Driver</th>
                    <th>No. of Passengers</th>
                  </tr>
                </thead>
                <tbody id="tb_DriverUpcomingDrives"></tbody>
              </table>
            </div>
          </div>

          <div id="riderDB" style={{display: 'none'}}>
            <div id='div_RiderNotifications'>
              <h4>Notifications</h4>
              <table>
                <tbody id="tb_RiderNotifications"></tbody>
              </table>
            </div>
            <h4>Upcoming Rides</h4>
            <div id='div_RiderUpcomingRides'>
              <table>
                <thead>
                  <tr>
                    <th>Area</th>
                    <th>Date & Time</th>
                    <th>Driver</th>
                    <th>No. of Passengers</th>
                  </tr>
                </thead>
                <tbody id="tb_RiderUpcomingRides"></tbody>
              </table>
            </div>
          </div>
        </div>
      </View>
      );
    }
  }

export default Dashboard;
