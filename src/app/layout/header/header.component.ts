import { Component, OnInit } from '@angular/core';

import * as blockstack from 'node_modules/blockstack/dist/blockstack.js';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  constructor() { }
  isSignIn : boolean = false;
  userName :string  = 'User name';
  private LOGO = require("../../../assets/logo-header.png");

  ngOnInit() {
    var userSession = new blockstack.UserSession()
    if (userSession.isSignInPending()) {
        userSession.handlePendingSignIn()
        .then(userData => {
            const profile = userData.profile;
            this.isSignIn = true;
            this.userName = userData.username;

        })
    } else 
    
    if (userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData();
       this.isSignIn = true;
       this.userName = userData.username;
     } 
  }

  signIn():void{
    blockstack.redirectToSignIn();
    var userSession = new blockstack.UserSession()
    if (userSession.isSignInPending()) {
        userSession.handlePendingSignIn()
        .then(userData => {
            const profile = userData.profile;
            this.isSignIn = true;
            this.userName = userData.username;
        })
    }
  }

  signOut():void{
    blockstack.signUserOut(window.location.origin);
  }



}
