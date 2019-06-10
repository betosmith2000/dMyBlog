import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import * as blockstack from 'node_modules/blockstack/dist/blockstack.js';
import { ActivatedRoute } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';


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
  isShareURL:boolean=false;
  private LOGO = require("../../assets/logo-header.png");
  readonly postsFileName:string = '/posts.txt';

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

  isMissingPost:boolean=false;
  userName :string  = '';
  postId :string = '';
  posts:any;
  constructor(private route: ActivatedRoute, private ngxService: NgxUiLoaderService) { }

  ngOnInit() {
   
    this.route.paramMap.subscribe(params => {
      const appConfig = new blockstack.AppConfig(['store_write', 'publish_data'])
      this.userSession = new blockstack.UserSession({appConfig:appConfig});

      this.ngxService.start();

      this.userName = params.get("userBlog");
      this.postId = params.get("postId");
      if(this.userName && this.postId){
        this.Post = null;
        this.isShareURL = true;
      }
      else{
        this.isShareURL = false;
      }
      


      if((this.userName==null || this.userName.trim() =='') ){
        //const userData = this.userSession.loadUserData();
        this.userName = this.Post.author;
      }
      if(this.postId == null || this.postId.trim() == ''){
        this.postId= this.Post.id;
      }
      this.readOptions.username = this.userName;
      if(this.Post==null){
        this.userSession.getFile(this.postsFileName,this.readOptions)
        .then((fileContents) => {
          this.posts = JSON.parse(fileContents);
          if(this.posts == null)
            this.posts=new Array();
          let post = this.posts.filter(e=> e.id == this.postId && e.status != 0);
          if(post.length > 0){
            this._post = post[0];
            this.isMissingPost  =false;
          }
          else{
            this.isMissingPost = true;
            
          }
          this.readPost();
        })
        .catch((error)=>{
          console.log('Error loading post collection');
          this.ngxService.stop();
          
        });
  
      }
      else{
        this.readPost()
      }
    });

   
  }

  readPost():void{
    this.userSession.getFile(this.Post.postFileName,this.readOptions)
    .then((fileContents) => {
      this.viewingPost = JSON.parse(fileContents);
      this.title = this.viewingPost.postTitle;
      this.content = this.viewingPost.postContent;
      this.author = this.Post.author;
      this.date = this.Post.date;
      this.getPostImage(this.Post);
      this.ngxService.stop();

    })
    .catch((error)=>{
      console.log('Error reading post');
      this.ngxService.stop();        
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
