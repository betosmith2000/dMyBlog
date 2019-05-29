import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import * as blockstack from 'node_modules/blockstack/dist/blockstack.js';
import { ActivatedRoute } from '@angular/router';


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
  readOptions : any = {decrypt: false, username: null};
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


  userName :string  = '';
  postId :string = '';

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    const appConfig = new blockstack.AppConfig(['store_write', 'publish_data'])
    this.userSession = new blockstack.UserSession({appConfig:appConfig});
    this.route.paramMap.subscribe(params => {
      this.userName = params.get("userBlog");
      this.postId = params.get("postId");

      if(this.userName==null || this.userName.trim() ==''){
        const userData = this.userSession.loadUserData();
        this.userName = userData.username;
      }
      this.readOptions.username = this.userName;
      this.userSession.getFile(this.Post.postFileName,this.readOptions)
      .then((fileContents) => {
        this.viewingPost = JSON.parse(fileContents);
        this.title = this.viewingPost.postTitle;
        this.content = this.viewingPost.postContent;
        this.author = this.Post.author;
        this.date = this.Post.date;
        this.getPostImage(this.Post);
      });
    });

   
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
