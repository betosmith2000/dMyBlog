import { Component, OnInit } from '@angular/core';
import { Post } from './models/Post';
import { ApiService } from '../share/data-service';
import * as blockstack from 'node_modules/blockstack/dist/blockstack.js';
import { Pagination } from '../share/pagination';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { InteractionTypeResult } from './models/InteractionTypeResult';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.component.html',
  styleUrls: ['./discover.component.scss']
})
export class DiscoverComponent implements OnInit {
  
  posts:any=new Array();
  isViewingPost : boolean = false;
  shareTitle : string = 'Share this ';
  userSession :any;
  readOptions : any = {decrypt: false, username: null};
  selectedPost: any;
  searchTerm : string='';
  userName :string  = '';

  private LOGO = require("../../assets/logo-header.png");
   //Paginacion
   page: number = 0;
   pagination: Pagination<Post> = new Pagination(10, 0);


  constructor(private _api:ApiService, private ngxService: NgxUiLoaderService) { 
    _api.setApi('Posts');
  }

  ngOnInit() {
    const appConfig = new blockstack.AppConfig(['store_write', 'publish_data'])
    this.userSession = new blockstack.UserSession({appConfig:appConfig});
    if(this.userSession.isUserSignedIn())
    {
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
