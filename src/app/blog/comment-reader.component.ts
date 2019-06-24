import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PostComment } from './models/comment';
import * as blockstack from 'node_modules/blockstack/dist/blockstack.js';
import { ApiService } from '../share/data-service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Post } from './models/Post';

@Component({
  selector: 'app-comment-reader',
  templateUrl: './comment-reader.component.html',
  styleUrls: ['./comment-reader.component.scss']
})
export class CommentReaderComponent implements OnInit {
  
  userLoggedIn:string;
  canEdit: boolean = false;
  canReply:boolean = false;
  userSession : any;
  readOptions : any = {decrypt: false, username: null};
  writeOptions : any = {encrypt:false};
  isEditing :boolean=false;
  isNewComment :boolean = false;

  @Output() deleteComment = new EventEmitter();
  @Output() updateComment = new EventEmitter();
  @Output() cancelComment = new EventEmitter();


  private _comment: PostComment = null;
  @Input()
  set Comment(comment: PostComment) {
      this._comment = comment;

  }
  get Comment(): PostComment {
      return this._comment;
  }

  constructor(private _api:ApiService, private ngxService: NgxUiLoaderService) {

   }

  ngOnInit() {
    const appConfig = new blockstack.AppConfig(['store_write', 'publish_data'])
    this.userSession = new blockstack.UserSession({appConfig:appConfig});
    if(this.userSession.isUserSignedIn())
    {
      
      const userData = this.userSession.loadUserData();
      this.userLoggedIn = userData.username;
      this.canEdit = this.userLoggedIn === this.Comment.userId;
      this.canReply = true;
      this.isNewComment =false;
        
      if(!this.Comment.id ){
        this.isEditing = true;
        this.canEdit = true;
        this.isNewComment =true;
        this.Comment.userId = userData.username;
        return;
      }
    }
    else{
      this.userLoggedIn = "-";
      this.canEdit = false;
      this.canReply=false;
    }
    this.getCommentFile(this.Comment);

  }


  
  getCommentFile(comment :PostComment):void{
    
    this.readOptions.username = comment.userId;
    this.userSession.getFile(comment.fileName,this.readOptions)
    .then((fileContent) => {
      comment.content = fileContent;
    })
    .catch(err=>{
      console.log("Error read image file");
    });
  }

  delete(c:PostComment){
    
    this._api.setApi('comments');

    if(confirm('Are you sure you want to delete this comment?')){
      this.ngxService.start(); 
      this._api.delete(c.id)
      .subscribe(res => {
        this.userSession.putFile(c.fileName,'Deleted!', this.writeOptions)
        .then(() =>{
          this.deleteComment.emit(c);
          this.ngxService.stop();
        })
        .catch((error)=>{
          console.log('Error deleting comment');
          this.ngxService.stop();
        });

        this.ngxService.stop();
        console.log('Delete comment, id:' + c.id);
      }, error =>{
        console.log('Error to save comment to index');
        this.ngxService.stop();

      });

    }
    
  }
  showUpdate():void{
    this.isEditing = true;
  }
  closeEdition(c:PostComment){
    if(!this.Comment.id)
      this.cancelComment.emit(c);
    else
      this.updateComment.emit(c);
    this.isEditing = false;
    
  }
}
