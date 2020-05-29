import firebase from '../../../base';
import * as moment from 'moment';
import {user} from "./checkEmailWallet";
import car from '../../assets/images/car.png';

export const getLastFiveBookings = () => {
    let userDetails = [];
    document.getElementById('tb_LastFiveTransactions').innerHTML = '';

    // get all accounts
    firebase.database().ref('accounts')
        .orderByChild('email')
        .once('value')
        .then((snapshot) => {
            let i = 0;
            snapshot.forEach((child) => {
                userDetails[i] = child.key + ":" + child.val().uname + ":" + child.val().fname + ":" + child.val().lname;
                i++;
            })
        });

    const database = firebase.database().ref('bookings').orderByChild('date').limitToFirst(5).endAt(Date.now());
    database.once('value', (snapshot) => {
        if (snapshot.exists()) {
            let content = '';
            snapshot.forEach((data) => {
                if ((data.val().currPassengers.includes(user[2]) || data.val().driverID === user[9]) && data.val().completed === 'yes') {
                    let area = data.val().area;
                    let date = moment.unix(data.val().date / 1000).format("DD MMM YYYY hh:mm a");

                    let id = data.val().driverID;
                    let driver = '';

                    for (let i = 0; i < userDetails.length; i++) {
                        let key = [];
                        key = userDetails[i].split(':');
                        if (key[0] === id) {
                            driver = key[1];
                        }
                    }

                    content += '<div class=transaction-box id=' + data.key + '>';
                    content += '<img src=' + car + ' class=transaction-icon />';
                    content += '<div><p class=transaction-label>' + driver + '</p>';
                    content += '<p class=transaction-amount>' + area + '</p>';
                    content += '<p class=transaction-label>' + date + '</p>';
                    content += '</div></div>';
                    
                    /*content += '<tr id=\'' + data.key + '\'>';
                    content += '<td>' + area + '</td>'; //column1
                    content += '<td>' + date + '</td>'; //column2
                    content += '<td>' + driver + '</td>';
                    content += '</tr>';*/
                }
            });
            document.getElementById('tb_LastFiveTransactions').innerHTML += content;
        }
    });
}