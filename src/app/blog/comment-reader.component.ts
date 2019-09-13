import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { PostComment } from './models/comment';
import * as blockstack from 'node_modules/blockstack/dist/blockstack.js';
import { ApiService } from '../share/data-service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Post } from './models/Post';
import { ToastrService } from 'ngx-toastr';
import { GlobalsService } from '../share/globals.service';

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
  selectedTheme:string ='dark';

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

  constructor(private _api:ApiService, private ngxService: NgxUiLoaderService,  
    private cdRef:ChangeDetectorRef,  private toastr: ToastrService,
     private globals: GlobalsService,
    ) {

   }

  ngOnInit() {
    this.selectedTheme= this.globals.getCurrentTheme();
    this.globals.getTheme().subscribe(theme=>{
      this.selectedTheme = theme;
    });

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
      this._api.deleteComment(c.id, c.rootId)
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
        this.toastr.error("The comment can not be deleted because it contains some answers already!");
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
    else{
      this.isNewComment=false;
      this.updateComment.emit(c);
    }
    this.isEditing = false;
    
  }

  responseComment(comment:PostComment){
    if(!this.userSession.isUserSignedIn()){
      this.toastr.info("You need to login to add a comment!","Information")
      return;
    }
    let idx = comment.comments!=null? comment.comments.findIndex(e=> e.id == ""): -1;

    if(idx!==-1){
      let idComment = 'commentZ'+(comment.comments.length-1);

       document.getElementById(idComment).scrollIntoView({behavior: 'smooth'});
       return;
     }
    let c  = new PostComment();    
    c.postId = comment.postId;
    c.id="";
    c.rootId = comment.rootId!= null && comment.rootId!=""?comment.rootId:comment.id;
    c.parentId=this._comment.id;
    
    if(!comment.comments)
      comment.comments = new Array<PostComment>()
    comment.comments.push(c);
    this.cdRef.detectChanges();
    let idComment = 'commentZ'+(comment.comments.length-1);
    document.getElementById(idComment).scrollIntoView({behavior: 'smooth'});
  }

  
  onDeleteComent(c:PostComment){
    let idx = this.Comment.comments.findIndex(e=> e.id == c.id);
    this.Comment.comments.splice(idx,1);
    this.toastr.success("The comment was delete!",'Success')        

    
  }

  
  onCancelComment(c:PostComment){

    if(!c){
      let idx = this.Comment.comments.findIndex(e=> e.id == "");
      if(idx!== -1)
      this.Comment.comments.splice(idx,1);
    }
  }
}
