import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';

import * as blockstack from 'node_modules/blockstack/dist/blockstack.js';
import { ActivatedRoute } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Pagination } from '../share/pagination';
import { ApiService } from '../share/data-service';
import { PostComment } from './models/comment';
import { ToastrService } from 'ngx-toastr';
import * as introJs from 'intro.js/intro.js';



@Component({
  selector: 'app-post-reader',
  templateUrl: './post-reader.component.html',
  styleUrls: ['./post-reader.component.scss']
})
export class PostReaderComponent implements OnInit {
  introJS = introJs();
  isShowingTour :boolean=false;

  title:string;
  content:string;
  imageContent:string;
  author:string;
  date:Date;
  isShareURL:boolean=false;
  shareTitle:string;
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

  constructor(private route: ActivatedRoute, private ngxService: NgxUiLoaderService, private _api:ApiService,
     private toastr: ToastrService, private cdRef:ChangeDetectorRef) {
   }


   
  startTour(start:boolean) {
    var h = localStorage.getItem('dmyblog.readPostHelp');
    if(h=="1" && !start)
      return;

    this.isShowingTour=true;
   
    this.introJS.setOptions({
      steps: [
        {
          intro: "Welcome to <strong>Reading Post</strong> section, let's take a tour!"
        },
        {
          element: '#step1',
          intro: "This is the header of the Post, here you can find the Title, author and date in which the Post was published.",
          disableInteraction:true
        },
        {
          element: '#step2',
          intro: "This is the body of the post, it is probably very interesting so let's read it!",
          disableInteraction:true,
          position:"top",
          scrollTo:"tooltip"
        },
        {
          element: "#step3",
          intro: "Here are the comments of the users, you can read them to find some corrections, recommendations or extra information!",
          position:"top",
          disableInteraction:true
        },
        {
          element: '#step4-read',
          intro: "If you liked the Post and want to share it, this is the place to do it, you have link, facebook or twitter options!.",
          disableInteraction:true,
          position:"left",
          tooltipPosition:'auto'
        },
        {
          element: '#step5',
          intro: "By the way, if you want to make a comment then here you have the option to do so.",
          disableInteraction:true,
          position:"left"
        },
        {
          element: "#step6",
          intro: "If you like the Post then you can indicate by pressing this button!",
          disableInteraction:true,
          position:"left"

        },
        {
          element: "#step7",
          intro: "Finally, If you don't like the Post then you can indicate by pressing this button!",
          disableInteraction:true,
          position:"left"

        },
      ]
    });
  this.introJS.onafterchange(function(targetElement) {
      if(this._currentStep == 4){
          let overlay:any = document.getElementsByClassName("introjs-fixedTooltip");
          for(let i=0; i<overlay.length; i++) {
            overlay[i].style.top = "165px";
            overlay[i].style.right = "20px";
            overlay[i].style.position = "fixed";
          }
      }
      else if(this._currentStep == 5){
        let overlay:any = document.getElementsByClassName("introjs-fixedTooltip");
        for(let i=0; i<overlay.length; i++) {
          overlay[i].style.top = "235px";
          overlay[i].style.right = "20px";
          overlay[i].style.position = "fixed";
        }
      }
      else if(this._currentStep == 6){
        let overlay:any = document.getElementsByClassName("introjs-fixedTooltip");
        for(let i=0; i<overlay.length; i++) {
          overlay[i].style.top = "335px";
          overlay[i].style.right = "20px";
          overlay[i].style.position = "fixed";
        }
      }
      else if(this._currentStep == 7){
        let overlay:any = document.getElementsByClassName("introjs-fixedTooltip");
        for(let i=0; i<overlay.length; i++) {
          overlay[i].style.top = "405px";
          overlay[i].style.right = "20px";
          overlay[i].style.position = "fixed";
        }
      }
  });


    this.introJS.start();
    this.introJS.onexit(x =>{
    
      this.isShowingTour=false;
      localStorage.setItem('dmyblog.readPostHelp',"1");

    });
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


  
  sharePost(){
    this.shareTitle = "Share this Post!"
  }

  commentPost(){
    let idx = this.comments.findIndex(e=> e.id == "");

    if(idx!==-1){
      document.getElementById('commentN'+(idx)).scrollIntoView({behavior: 'smooth'});
      return;
    }
    let c  = new PostComment();    
    c.postId = this.Post.id;
    c.id="";
    this.comments.push(c);
    this.cdRef.detectChanges();
    let idComment = 'commentN'+(this.comments.length-1);
    document.getElementById(idComment).scrollIntoView({behavior: 'smooth'});
  }

  closeComments(comment:any):void{
    if(comment){
      this.content ='Loading content...';
      this.comments.push(comment);
    }
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
      this.startTour(false);
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
  }

  onCancelComment(c:PostComment){

    if(!c){
      let idx = this.comments.findIndex(e=> e.id == "");
      if(idx!== -1)
        this.comments.splice(idx,1);
    }
  }
}
