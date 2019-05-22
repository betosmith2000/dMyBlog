import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import * as blockstack from 'node_modules/blockstack/dist/blockstack.js';


@Component({
  selector: 'app-post-reader',
  templateUrl: './post-reader.component.html',
  styleUrls: ['./post-reader.component.scss']
})
export class PostReaderComponent implements OnInit {

  title:string;
  content:string;
  imageContent:string;
  author:string;
  date:Date;
  private LOGO = require("../../assets/logo-header.png");

  userSession : any;
  readOptions : any = {decrypt: false};
  viewingPost : any;
  private _post: any = null;
  @Input()
  set Post(post: any) {
      this._post = post;
  }
  get Post(): any {
      return this._post;
  }

  @Output() closed = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
    const appConfig = new blockstack.AppConfig(['store_write', 'publish_data'])
    this.userSession = new blockstack.UserSession({appConfig:appConfig});
    if (this.userSession.isUserSignedIn() && this.Post!=null) {
      this.userSession.getFile(this.Post.postFileName,this.readOptions)
        .then((fileContents) => {
          this.viewingPost = JSON.parse(fileContents);
          this.title = this.viewingPost.postTitle;
          this.content = this.viewingPost.postContent;
          this.author = this.Post.author;
          this.date = this.Post.date;
          this.getPostImage(this.Post);
        });
     } 
  }

  close():void{
    this.closed.emit(null);
  }

  
  getPostImage(p:any):void {
    if(p.imageFileName== null || p.imageFileName=='')
      this.imageContent= this.LOGO;
    else 
    {
      this.userSession.getFile(p.imageFileName,this.readOptions)
      .then((imageContent) => {
        this.imageContent= imageContent;
      });
    }
  }

}
