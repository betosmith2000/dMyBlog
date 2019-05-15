import { Component, OnInit } from '@angular/core';

import * as blockstack from 'node_modules/blockstack/dist/blockstack.js';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';


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
  blogHeaderImage : FormControl;
  constructor(private toastr: ToastrService) { }

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
            this.blogHeaderImage.setValue(data.blogHeaderImage);
          }
        });
     } 

     
  }

  initializeForm():void{
    this.blogName = new FormControl('', [Validators.maxLength(64)]);
    this.blogDescription = new FormControl('', [Validators.maxLength(1024)]);
    this.blogHeaderImage = new FormControl('');

    this.form = new FormGroup({
      blogName : this.blogName,
      blogDescription : this.blogDescription,
      blogHeaderImage : this.blogHeaderImage
    });
  }

  save(){
    let p = Object.assign({},  this.form.value);
    let str = JSON.stringify(p);
    this.userSession.putFile(this.settingsFileName,str, this.writeOptions)
      .then(() =>{
        this.toastr.success("The changes have been saved!",'Success')  
    });

  }

  handleInputChange(e) {
    var file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];

    var pattern = /image-*/;
    var reader = new FileReader();

    if (!file.type.match(pattern)) {
        alert('invalid format');
        return;
    }


    reader.onload = this._handleReaderLoaded.bind(this);
    reader.readAsDataURL(file);
    
  }

  _handleReaderLoaded(e) {
    var reader = e.target;
    this.blogHeaderImage.setValue( reader.result);
    
  }

}
