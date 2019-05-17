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
  image :string ="";
  readonly settingsFileName:string = '/settings.txt';
  readOptions : any = {decrypt: false};
  writeOptions : any = {encrypt:false};
  isNewPost : boolean = false;
  private LOGO = require("../../assets/logo-header.png");
  selectedPost: any;


  readonly postsFileName:string = '/posts.txt';
  readonly postContentFileName:string = '/post-ID.txt';
  readonly postImageFileName:string = '/post-img-ID.txt';
  posts:any;
  constructor() { }

  ngOnInit() {
    this.userSession = new blockstack.UserSession()
    if (this.userSession.isUserSignedIn()) {
      const userData = this.userSession.loadUserData();
      this.userName = userData.username;
    
      this.userSession.getFile(this.settingsFileName,this.readOptions)
        .then((fileContents) => {
          this.header = JSON.parse(fileContents);
          this.image = this.header.blogHeaderImage;

        this.userSession.getFile(this.postsFileName,this.readOptions)
          .then((postContents) => {
            this.posts = JSON.parse(postContents);
            if(this.posts == null)
              this.posts = new Array();
            this.posts.forEach(p => {
              p.imageFileContent = null;
              this.getPostImage(p);
            });
          });

        });
     } 
  }

  getPostImage(p:any):string {
    if(p.imageFileName== null || p.imageFileName=='')
      return this.LOGO;
    else 
    {
      this.userSession.getFile(p.imageFileName,this.readOptions)
      .then((imageContent) => {
        p.imageFileContent= imageContent;
      });
    }
  }

  showNewPost():void{
    this.selectedPost = null;
    this.isNewPost = true;
  }
  

  
  onClosed(res: boolean): void {

    this.isNewPost = false;
    if(res)
    {

    }
    else{
      
    }
}



}
