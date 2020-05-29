import firebase from '../../../base';
import {checkEmailWallet, user} from './checkEmailWallet';
import {maxAmtCalc} from './maxAmtCalc';
import {topUpWalletPage} from './topUpWalletPage';
import {walletHomePage} from './walletHomePage';
import {cashOut} from './cashOut';
import {submitCashOut} from './submitCashOut';
import {transactionsPage} from './transactionsPage';
import StripeCheckout from 'react-stripe-checkout'
import '../../constants/custom.css';

import React from 'react';
import { View } from 'react-native';
import 'firebase/firestore';

const checkoutUrl = "https://us-central1-carpool-world-5uck5.cloudfunctions.net/charge";

class Wallet extends React.Component {
    constructor(props) {
        super(props);
        //this.handleToken = this.handleToken.bind(this);
        this.setTwoNumberDecimal = this.setTwoNumberDecimal.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.state = {
            amount: '0.00',
            maxAmt: maxAmtCalc(),
            cashoutamount: '',
            token: null,
            firstName: '',
            lastName: '',
            username: '',
            email: '',
            phone: '',
            isDriver: '',
            isAdmin: '',
            wallet: '',
            id: '',
            rating: '',
            ratedBy: '',
        }
    }

    componentDidMount() {
        checkEmailWallet();

        const accountsRef = firebase.database().ref('accounts');
        accountsRef.orderByChild('email')
            .equalTo(firebase.auth().currentUser.email)
            .once('value')
            .then((snapshot) => {
                snapshot.forEach((child) => {
                this.setState({
                    firstName: child.val().fname,
                    lastName: child.val().lname,
                    username: child.val().uname,
                    email: child.val().email,
                    phone: child.val().phone,
                    isDriver: child.val().isDriver,
                    isAdmin: child.val().isAdmin,
                    wallet: child.val().wallet,
                    id: child.key,
                    rating: child.val().rating,
                    ratedBy: child.val().ratedBy
                }, () => {
                    if (this.state.isBanned === 'yes') {
                        alert('Your account has been banned');
                        firebase.auth().signOut();
                    }
                })
            })
        })
    }

    handleChange(e) {
        this.setState({
            [e.target.name]: e.target.value
        });
    }

    // sets amount in text box to two decimal places on blur and sets to this.state.amount
    setTwoNumberDecimal(e) {
        e.target.value = parseFloat(e.target.value).toFixed(2);
        this.setState({
            [e.target.name]: e.target.value
        });
    }

    submitCashOut_Click = () => {
        const balance = parseFloat(this.state.wallet - this.state.cashoutamount).toFixed(2);

        this.setState({
            wallet: balance
        }, () => {
            submitCashOut(this.state.cashoutamount);
        });

        this.state = {
            cashoutamount: ''
        };
    } 

    gotoWalletPage = () => {
        const transaction = firebase.database().ref('transaction');
        const transactionForm = {
            user: user[2],
            email: user[3],
            token: this.state.token,
            amount: this.state.amount,
            date: Date.now() * -1,
            action: 'top-up'
        }

        transaction.push(transactionForm);
        const balance = parseFloat(user[8]) + parseFloat(this.state.amount);
        this.setState({
            wallet: balance
        })

        const accountsRef = firebase.database().ref('accounts/' + user[9]);
        accountsRef.orderByChild('email')
            .equalTo(user[3])
            .once('value')
            .then((snapshot) => {
                snapshot.ref.update({
                    wallet: balance
                })
            });

        walletHomePage();
    }

    handleToken = (token) => {
        this.setState({ token: token.id });
        fetch(checkoutUrl, {
            method: "POST",
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                token,
                charge: {
                    amount: parseInt(this.state.amount * 100),
                    currency: 'SGD'
                }
            }),
        })
            .then(res => {
                return res.json();
            })
            .then(result => {
                if (result.statusCode === 200) {
                    this.gotoWalletPage()
                }
            })
            .catch(error => {
                console.error(error);
            });
    }

    render() {
        return (
        <View style={{ width: '100%', justifyContent: "center", alignItems: "center" }}>
        <div id='homePage'>
        <h1>$ {parseFloat(this.state.wallet).toFixed(2)}</h1>
            <div>
              <button id='btnWalletHome' onClick={ walletHomePage }>Wallet</button>
              <button id='btnTransactionPage' onClick={ transactionsPage }>Transactions</button>
            </div>
            <br/>
            <div id='div_WalletHome'>
                <div>
                    <br/>
                    <br/>
                    <div id="tbl_last5">
                        <h4>Last 5 Bookings</h4>
                        <div id="tb_LastFiveTransactions"></div>
                    </div>
                </div>
                <br/>
                <div>
                    <button id='btnTopUpPage' onClick={ topUpWalletPage }>Top-Up</button>
                    <button id='btnCashOut' onClick={ cashOut }>Cash-Out</button>
                </div>
            </div>
            <div id='div_WalletTopUp' style={{display: 'none'}}>
                <input type='number' step='0.01' min='0.01' value={this.state.amount} onBlur={this.setTwoNumberDecimal} onChange={this.handleChange} name='amount' /><br/><br/>
                <StripeCheckout
                    stripeKey='pk_test_K5hyuKJAvnl8PNzfuwes3vn400X0HYzEvv'
                    token={this.handleToken}
                    amount={parseInt(this.state.amount * 100)}
                    name="E-Wallet Top-Up"
                    currency="SGD"
                    email={user[3]}
                />
            </div>
            <div id='div_CashOut' style={{display: 'none'}}>
                <input id='cashOutInput' type='number' step='0.01' min='0.01' max={this.state.maxAmt} value={this.state.cashoutamount} onBlur={this.setTwoNumberDecimal} onChange={this.handleChange} name='cashoutamount' />
                <br/><br/>
                <button id='btnSubmitCashOut' onClick={ this.submitCashOut_Click }>Cash-Out</button>
            </div>
            <div id='div_WalletHistory' style={{display: 'none'}}>
                <h4>Transaction History</h4>
                <div id="tb_AllTransactions"></div>
            </div>
        </div>
        </View>
        );
    }
}

export default Wallet;