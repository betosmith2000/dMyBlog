import { Component, OnInit } from '@angular/core';
import { Post } from './Post';
import { ApiService } from '../share/data-service';
import * as blockstack from 'node_modules/blockstack/dist/blockstack.js';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.component.html',
  styleUrls: ['./discover.component.scss']
})
export class DiscoverComponent implements OnInit {
  
  posts:any=new Array();
  isViewingPost : boolean = false;
  shareTitle : string = 'Share this ';
  postId:string = null;
  userSession :any;
  userName:string;
  readOptions : any = {decrypt: false, username: null};
  selectedPost: any;

  private LOGO = require("../../assets/logo-header.png");
  
  constructor(private _api:ApiService) { 
    _api.setApi('Posts')
  }

  ngOnInit() {
    const appConfig = new blockstack.AppConfig(['store_write', 'publish_data'])
    this.userSession = new blockstack.UserSession({appConfig:appConfig});

    this._api.getAll<Post[]>("").subscribe(d => {
      this.posts = d;
      this.posts.forEach(p => {
        p.imageFileContent = null;
        this.getPostImage(p);
      });
    });
  }

  getPostImage(p:any):void {
    if(p.imageFileName== null || p.imageFileName=='')
      p.imageFileContent= this.LOGO;
    else 
    {
      this.readOptions.username = p.author;
      this.userSession.getFile(p.imageFileName,this.readOptions)
      .then((imageContent) => {
        p.imageFileContent= imageContent;
      });
    }
  }

  
  sharePost(event:Event, p:any){
    //event.stopPropagation();    
    this.shareTitle = "Share this Post!"
    this.postId=p.shareCode?p.shareCode:p.id;
    this.userName = p.author;
  }

  
  onClosedViewer(res: any): void {
    this.isViewingPost = false;
  }

  
  viewPost(p:any){
    this.selectedPost = p;
    this.isViewingPost = true;
  }

}
