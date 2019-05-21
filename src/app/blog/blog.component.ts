import { Component, OnInit } from '@angular/core';
import * as blockstack from 'node_modules/blockstack/dist/blockstack.js';
import { ToastrService } from 'ngx-toastr';

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
  isAdmin : boolean = false;
  private LOGO = require("../../assets/logo-header.png");
  selectedPost: any;


  readonly postsFileName:string = '/posts.txt';
  readonly postContentFileName:string = '/post-ID.txt';
  readonly postImageFileName:string = '/post-img-ID.txt';
  posts:any;
  constructor(private toastr: ToastrService) { }

  ngOnInit() {
    const appConfig = new blockstack.AppConfig(['store_write', 'publish_data'])
    this.userSession = new blockstack.UserSession({appConfig:appConfig});
    if (this.userSession.isUserSignedIn()) {
      const userData = this.userSession.loadUserData();
      this.userName = userData.username;
      this.isAdmin = true;
    
      this.userSession.getFile(this.settingsFileName,this.readOptions)
        .then((fileContents) => {
          this.header = JSON.parse(fileContents);
          this.image = this.header ? this.header.blogHeaderImage: null;

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

  getPostImage(p:any):void {
    if(p.imageFileName== null || p.imageFileName=='')
      p.imageFileContent= this.LOGO;
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
  

  
  onClosed(res: any): void {

    this.isNewPost = false;
    if(res)
    {
      res.imageFileContent = null;
      this.getPostImage(res);
      this.posts.push(res);
    }
   
  }

  deletePost(p:any):void{
    let idx = this.posts.findIndex(e=> e.id == p.id);
  if(confirm('Are you sure you want to delete this post?')){
      this.posts.splice(idx,1);
      let postsArray = JSON.stringify(this.posts);

      this.userSession.putFile(this.postsFileName,postsArray, this.writeOptions)
      .then(() =>{
        this.toastr.success("The post was delete!",'Success')  

        this.userSession.deleteFile(p.postFileName);
        if(p.imageFileName)
          this.userSession.deleteFile(p.imageFileName);
      
      });
    }
  }

  editPost(p:any):void{
    this.selectedPost = p;
    this.isNewPost = true;
  }



}