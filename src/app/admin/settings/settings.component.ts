import { Component, OnInit } from '@angular/core';

import * as blockstack from 'node_modules/blockstack/dist/blockstack.js';
import { FormGroup, FormControl, Validators } from '@angular/forms';


@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  userName :string  = 'User name';
  readonly settingsFileName:string = '/settings.txt';
  readOptions : any = {decrypt: false};
  writeOptions : any = {encrypt:false};
  userSession :any;

  form : FormGroup;
  blogName : FormControl;
  blogDescription: FormControl;

  constructor() { }

  ngOnInit() {
    this.initializeForm();
    this.userSession = new blockstack.UserSession()
    if (this.userSession.isUserSignedIn()) {
      const userData = this.userSession.loadUserData();
      this.userName = userData.username;
    
      this.userSession.getFile(this.settingsFileName,this.readOptions)
        .then((fileContents) => {
          let data = JSON.parse(fileContents);
          if(data!= null && data.blogName){
            this.blogName.setValue(data.blogName);
            this.blogDescription.setValue(data.blogDescription);
          }
        });
     } 

     
  }

  initializeForm():void{
    this.blogName = new FormControl('', [Validators.maxLength(64)]);
    this.blogDescription = new FormControl('', [Validators.maxLength(1024)]);

    this.form = new FormGroup({
      blogName : this.blogName,
      blogDescription : this.blogDescription
    });
  }

  save(){
    let p = Object.assign({},  this.form.value);
    let str = JSON.stringify(p);
    this.userSession.putFile(this.settingsFileName,str, this.writeOptions)
      .then(() =>{

    });

  }

}
