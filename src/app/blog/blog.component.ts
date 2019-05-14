import { Component, OnInit } from '@angular/core';
import * as blockstack from 'node_modules/blockstack/dist/blockstack.js';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss']
})
export class BlogComponent implements OnInit {
  header :any;
  userSession :any;
  userName :string  = '';
  readonly settingsFileName:string = '/settings.txt';
  readOptions : any = {decrypt: false};
  writeOptions : any = {encrypt:false};

  constructor() { }

  ngOnInit() {
    this.userSession = new blockstack.UserSession()
    if (this.userSession.isUserSignedIn()) {
      const userData = this.userSession.loadUserData();
      this.userName = userData.username;
    
      this.userSession.getFile(this.settingsFileName,this.readOptions)
        .then((fileContents) => {
          this.header = JSON.parse(fileContents);
        });
     } 
  }

}
