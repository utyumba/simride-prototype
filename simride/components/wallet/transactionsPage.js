// goes to transaction history page
import firebase from '../../../base';
import * as moment from 'moment';

export const transactionsPage = () => {
    document.getElementById('div_WalletHome').style.display = "none";
    document.getElementById('div_WalletTopUp').style.display = "none";
    document.getElementById('div_WalletHistory').style.display = "block";
    document.getElementById('div_CashOut').style.display = "none";

    document.getElementById('tb_AllTransactions').innerHTML = '';

    const database = firebase.database().ref('transaction').orderByChild('date');
    database.once('value', (snapshot) => {
        if (snapshot.exists()) {
            let content = '';
            snapshot.forEach((data) => {
                if (data.val().email === firebase.auth().currentUser.email) {
                    let amount = data.val().amount;
                    let date = moment.unix((data.val().date * -1) / 1000).format("DD MMM YYYY hh:mm a");
                    let action = data.val().action;
                    content += '<tr id=\'' + data.key + '\'>';
                    content += '<td>' + date + '</td>'; //column1
                    content += '<td>' + action + '</td>'; //column1
                    content += '<td>' + '$' + parseFloat(amount).toFixed(2) + '</td>'; //column2
                    content += '</tr>';
                }
            });

            document.getElementById('tb_AllTransactions').innerHTML += content;
        }
    });
}