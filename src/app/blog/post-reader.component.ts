import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import * as blockstack from 'node_modules/blockstack/dist/blockstack.js';
import { ActivatedRoute } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Pagination } from '../share/pagination';
import { ApiService } from '../share/data-service';
import { PostComment } from './models/comment';
import { ToastrService } from 'ngx-toastr';



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
  shareTitle:string;
  showNewRootComment:boolean=false;
  comments:any;
  private LOGO = require("../../assets/logo-header.png");
  readonly postsFileName:string = '/posts.txt';
   //Paginacion
   page: number = 0;
   pagination: Pagination<PostComment> = new Pagination(10, 0);

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
  constructor(private route: ActivatedRoute, private ngxService: NgxUiLoaderService, private _api:ApiService, private toastr: ToastrService) {
   }

  ngOnInit() {
    this.comments = new Array();
    const appConfig = new blockstack.AppConfig(['store_write', 'publish_data'])
    this.userSession = new blockstack.UserSession({appConfig:appConfig});
   


    this.route.paramMap.subscribe(params => {

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
      this.getData();
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
      })
      .catch((error)=>{
        console.log('Error reading image');
        this.ngxService.stop();        
      });
    }
  }


  
  sharePost(event:Event, p:any){
    this.shareTitle = "Share this Post!"
   // event.stopPropagation();  
  }

  commentPost(event:Event, p:any){
    this.showNewRootComment = !this.showNewRootComment ;
   // event.stopPropagation();  
  }
  closeComments(comment:any):void{
    if(comment){
      this.content ='Loading content...';
      this.comments.push(comment);
    }
    else{

    }
    this.showNewRootComment = false;
  }


  
  nextPage(): void {
    if (this.pagination.totalPages - 1 > this.pagination.pageNumber) {
        this.pagination.pageNumber++;
        this.getData();
    }
  }

  
  getData(){
    this.ngxService.start();
    let p = "pageSize=" + this.pagination.pageSize + "&pageNumber=" + this.pagination.pageNumber + "&postId=" + this.Post.id;
    this._api.setApi('comments');

    this._api.getAll<Pagination<PostComment>>(p).subscribe(d => {
    
      this.comments = d.data;
      this.pagination = d;
      this.page = d.pageNumber + 1;
      this.ngxService.stop();
    }, err => {
      this.ngxService.stop();
      console.log('Error loading comments');
    });
    
  }

  onDeleteComent(c:PostComment){
    let idx = this.comments.findIndex(e=> e.id == c.id);
    this.comments.splice(idx,1);
    this.toastr.success("The comment was delete!",'Success')        

    
  }

  onUpdateComment(c:PostComment){
    let comment = this.comments.filter(e=> e.id == c.id)[0];
    comment.content = c.content;
    comment.date = c.date;
    this.toastr.success("The comment was update!",'Success')    
  }
}
