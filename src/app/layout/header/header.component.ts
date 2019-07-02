import { Component, OnInit } from '@angular/core';

import * as blockstack from 'node_modules/blockstack/dist/blockstack.js';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  constructor(private route: Router) { }

  readonly settingsFileName:string = '/settings.txt';
  readOptions : any = {decrypt: false};

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
        this.userSession.getFile(this.settingsFileName,this.readOptions)
        .then((fileContents) => {
          let data = JSON.parse(fileContents);

          if(data.blogName== null || data.blogName =='')
            this.route.navigate(['settings/']);
          else
          this.route.navigate(['blog/' +this.userName]);
        })
        .catch((error)=>{
          console.log('Error reading settings');
        });

        
      })
    } else 
    
    if (this.userSession.isUserSignedIn()) {
      const userData = this.userSession.loadUserData();
      this.isSignIn = true;
      this.userName = userData.username;
      //this.route.navigate(['blog/' +this.userName]);
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
         // this.route.navigate(['blog/' +this.userName]);
        })
    }
  }

  signOut():void{
    this.userSession.signUserOut(window.location.origin);
  }



}
