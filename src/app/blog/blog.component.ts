import { Component, OnInit } from '@angular/core';
import * as blockstack from 'node_modules/blockstack/dist/blockstack.js';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';

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
  readOptions : any = {decrypt: false, username: null};
  writeOptions : any = {encrypt:false};
  isAdmin : boolean = false;
  isNewPost : boolean = false;
  isViewingPost : boolean = false;
  private LOGO = require("../../assets/logo-header.png");
  selectedPost: any;
  

  readonly postsFileName:string = '/posts.txt';
  readonly postContentFileName:string = '/post-ID.txt';
  readonly postImageFileName:string = '/post-img-ID.txt';
  posts:any = new Array();
  constructor(private toastr: ToastrService, private route:ActivatedRoute) { }

  ngOnInit() {
    const appConfig = new blockstack.AppConfig(['store_write', 'publish_data'])
    this.userSession = new blockstack.UserSession({appConfig:appConfig});
    this.route.paramMap.subscribe(params => {
      let userBlog = params.get("userBlog");
      this.userName = userBlog;
      if(!this.userSession.isUserSignedIn())
      {
        
        this.isAdmin = false;
      }
      else{
        const userData = this.userSession.loadUserData();
        if(this.userName==null || this.userName.trim() ==''){
          this.userName = userData.username;
        }
        if(this.userSession.isUserSignedIn() && this.userName == userData.username)
          this.isAdmin = true;
        else 
          this.isAdmin = false;
        
      }
      
      this.readOptions.username = this.userName;
      
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
          })
          .catch((error) => {
            console.log('Error reading post collection!')
          });;

        })
        .catch((error) => {
        console.log('Error reading settings!')
      });
    });

    
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
  
  viewPost(p:any){
    this.selectedPost = p;
    this.isViewingPost =true;
  }

  
  onClosed(res: any): void {
    this.isNewPost = false;
    if(res)
    {    
      let postResume = this.posts.filter(e => e.postFileName == res.postFileName );
      if(postResume.length==1){ //edit
        postResume = postResume[0];
        postResume.excerpt=res.excerpt;
        postResume.title = res.title;
        this.getPostImage(postResume);
      }else{
        res.imageFileContent = null;
        this.getPostImage(res);
        this.posts.push(res);
      }
    }
  }

  onClosedViewer(res: any): void {
    this.isViewingPost = false;
  }


  deletePost(event:Event, p:any):void{
    event.stopPropagation();
    if(confirm('Are you sure you want to delete this post?')){
      let idx = this.posts.findIndex(e=> e.id == p.id);

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
