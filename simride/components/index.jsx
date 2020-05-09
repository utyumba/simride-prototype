import React from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import Messages from './inbox/index.jsx';
import Account from './account/index.jsx';
import Booking from './booking/index.jsx';
import Home from './dashboard/index.jsx';
import Wallet from './wallet/index.jsx';
import Cashout from './cashcheckout/index.jsx';

export default function Start() {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/Booking">Bookings</Link>
            </li>
            <li>
              <Link to="/Messages">Messages</Link>
            </li>
            <li>
              <Link to="/Wallet">Wallet</Link>
            </li>
            <li>
              <Link to="/Checkout">Checkout Requests</Link>
            </li>
            <li>
              <Link to="/Account">Account</Link>
            </li>
          </ul>
        </nav>

        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Switch>
            <Route path="/Booking">
            <Booking />
          </Route>
          <Route path="/Messages">
            <Messages />
          </Route>
          <Route path="/Account">
            <Account />
          </Route>
          <Route path="/Wallet">
            <Wallet />
          </Route>
           <Route path="/Checkout">
              <Cashout />
          </Route>
          <Route path="/">
            <Home />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}