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
  LOGO = require("../../../assets/logo-header.png");
  userSession :any;

  ngOnInit() {
    const appConfig = new blockstack.AppConfig(['store_write', 'publish_data'])
    this.userSession = new blockstack.UserSession({appConfig:appConfig});
    if (this.userSession.isSignInPending()) {
        this.userSession.handlePendingSignIn()
        .then(userData => {
            //const profile = userData.profile;
            this.isSignIn = true;
            this.userName = userData.username;

        })
    } else 
    
    if (this.userSession.isUserSignedIn()) {
      const userData = this.userSession.loadUserData();
       this.isSignIn = true;
       this.userName = userData.username;
     } 
  }

  signIn():void{
    this.userSession.redirectToSignIn();
    if (this.userSession.isSignInPending()) {
        this.userSession.handlePendingSignIn()
        .then(userData => {
            //const profile = userData.profile;
            this.isSignIn = true;
            this.userName = userData.username;
        })
    }
  }

  signOut():void{
    this.userSession.signUserOut(window.location.origin);
  }



}
