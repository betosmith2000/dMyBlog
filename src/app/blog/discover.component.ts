import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Post } from './models/Post';
import { ApiService } from '../share/data-service';
import * as blockstack from 'node_modules/blockstack/dist/blockstack.js';
import { Pagination } from '../share/pagination';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { InteractionTypeResult } from './models/InteractionTypeResult';
import * as introJs from 'intro.js/intro.js';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.component.html',
  styleUrls: ['./discover.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DiscoverComponent implements OnInit {
  introJS = introJs();
  isShowingTour :boolean=false;
  isTourStared :boolean=false;
  posts:any=new Array();
  isViewingPost : boolean = false;
  shareTitle : string = 'Share this ';
  userSession :any;
  readOptions : any = {decrypt: false, username: null};
  selectedPost: any;
  searchTerm : string='';
  userName :string  = '';
  currentFilter:string='';
  isSignIn:boolean=false;

  private LOGO = require("../../assets/post-head.jpg");
   //Paginacion
   page: number = 0;
   pagination: Pagination<Post> = new Pagination(10, 0);


  constructor(private _api:ApiService, private ngxService: NgxUiLoaderService) { 
    _api.setApi('Posts');
  }

  
  
  startTour(start:boolean) {
    var h = localStorage.getItem('dmyblog.globalHelp');
    if(h=="1" && !start)
      return;

    this.isShowingTour=true;
    if(this.posts.length==0){
      let pEx = new Post();
      pEx.id="example";
      pEx.title="Example title post!";
      pEx.date=new Date().toISOString();
      pEx.status =2;
      this.getPostImage(pEx);
      this.getInteractions(pEx);
      this.posts.push(pEx);
    }

    let _steps= [
      {
        intro: "Welcome to <strong>Browse</strong> section. Here you can see the posts that users have created with the Public status, let's take a tour!"+
        "<br /><br />You can leave this tour at any time by clicking on the Skip button or outside this message box, you can also start it by clicking on the '?' Button."
      },
      {
        element: '#step1',
        intro: "Here you can filter the information either with the name of the author or with the title of the post.",
        disableInteraction:true
      },
      {
        element: '#step2',
        intro: "This is the list of post, sorted by dates from the most recent to the oldest. "+
        " You can view<button type='button' class='btn btn-link btn-sm'><i class='far fa-eye'></i></button>,"+
        " share<button type='button' class='btn btn-link btn-sm'><i class='fas fa-share-alt'></i></button> any post"+
        " you can also double click on any to see the content." +
        " <p>You can also see if your post has liked to readers<button type='button' class='btn btn-link btn-sm'><i class='far fa-thumbs-up'></i></button></p>",
        //" or not<button type='button' class='btn btn-link btn-sm'><i class='fas fa-grin-hearts'></i></button>.</p>",
        position:"top",
        disableInteraction:true

      },
      {
        element: "#step3",
        intro: "Finally, you can navigate between pages, each page is 10 posts.",
        disableInteraction:true


      }
      
    ];

    if(!this.isSignIn)
    _steps.push({
      intro: "If you are not a user yet you can access the platform by clicking on 'Sign In with Blockstack' button, it is very easy to start your own blog and write your first Post."
    });
    this.introJS.setOptions({
      steps :  _steps
    });
 
    this.introJS.start();
    this.introJS.onexit(x =>{
      let idx = this.posts.findIndex(e=> e.id == "example");
      if(idx!==-1)
        this.posts.splice(idx,1);
        
      this.isShowingTour=false;
      localStorage.setItem('dmyblog.globalHelp',"1");

    });
  }


  ngOnInit() {
    const appConfig = new blockstack.AppConfig(['store_write', 'publish_data'])
    this.userSession = new blockstack.UserSession({appConfig:appConfig});
    if(this.userSession.isUserSignedIn())
    {
      this.isSignIn = true;
      const userData = this.userSession.loadUserData();
      this.userName = userData.username;
    }

    this.getData();
  }

  getPostImage(p:any):void {
    if(p.imageFileName== null || p.imageFileName=='')
      p.imageFileContent= this.LOGO;
    else 
    {
      this.readOptions.username = p.author;
      this.userSession.getFile(p.imageFileName,this.readOptions)
      .then((imageContent) => {
        if(imageContent != null)
          p.imageFileContent= imageContent;
        else
          p.imageFileContent = this.LOGO;
      })
      .catch(err=>{
        console.log("Error read image file");
        this.ngxService.stop();

      });
    }
  }

  
  sharePost(event:Event, p:any){
    //event.stopPropagation();    
    this.shareTitle = "Share this Post!"
    this.selectedPost = p;

  }

  
  onClosedViewer(res: any): void {
    this.isViewingPost = false;
    this.getInteractions(this.selectedPost);

  }

  getInteractions(post:any){
    if(post.status>0){
      let p = "postId=" + post.id + "&userId=" + this.userName;
      this._api.setApi('Interactions');
      this._api.getAll<InteractionTypeResult>(p).subscribe(d => {
        post.interactions = d;
        this.ngxService.stop();
      }, err => {
        this.ngxService.stop();
        console.log('Error loading interactions');
      });
    }
  }
  
  
  viewPost(p:any){
    this.selectedPost = p;
    this.isViewingPost = true;
  }


  
  firstPage(): void {
    if (this.pagination.pageNumber !== 0) {
        this.pagination.pageNumber = 0;
        this.getData();
    }
  }

  previousPage(): void {
    if (this.pagination.pageNumber > 0) {
        this.pagination.pageNumber--;
        this.getData();
    }
  }


  nextPage(): void {
    if (this.pagination.totalPages - 1 > this.pagination.pageNumber) {
        this.pagination.pageNumber++;
        this.getData();
    }
  }

  lastPage(): void {
    if (this.pagination.pageNumber < this.pagination.totalPages - 1) {
        this.pagination.pageNumber = this.pagination.totalPages - 1;
        this.getData();
    }
  }

  toPage(): void {

    if (this.page != null && this.page - 1 < this.pagination.totalPages && this.page >= 1 ) {
        this.pagination.pageNumber = this.page - 1;
    }
    else {
        this.page = 1;
        this.pagination.pageNumber = 0;
    }
    this.getData();
  }

  getData(){
    this.ngxService.start();
    let p = "pageSize=" + this.pagination.pageSize + "&pageNumber=" + this.pagination.pageNumber + "&searchTerm=" + this.searchTerm;
    this._api.setApi('Posts');

    this._api.getAll<Pagination<Post>>(p).subscribe(d => {
      this.posts = d.data;
      this.pagination = d;
      this.page = d.pageNumber + 1;
      this.posts.forEach(p => {
        p.imageFileContent = null;
        this.getPostImage(p);
        
      });
      this.ngxService.stop();
      this.currentFilter = this.searchTerm;
      this.searchTerm="";
      if(!this.isTourStared)
        this.startTour(false);

    }, err => {
      this.ngxService.stop();
      console.log('Error loading posts');
    });
    
  }

  clearSearch():void{
    this.pagination.pageNumber  = 0;
    this.searchTerm = '';
    this.getData();
  }
  
  performSearch():void{
    this.pagination.pageNumber  = 0;
    this.getData();
  }
}
