import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Post } from './models/Post';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-inline';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import * as blockstack from 'node_modules/blockstack/dist/blockstack.js';
import { ApiService } from '../share/data-service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import { Md5 } from 'ts-md5/dist/md5';
import { PostComment } from './models/comment';

@Component({
  selector: 'app-post-comment',
  templateUrl: './post-comment.component.html',
  styleUrls: ['./post-comment.component.scss']
})
export class PostCommentComponent implements OnInit {
  userName:string;
  form :FormGroup;
  postContent:FormControl;
  readonly commentFileName:string = '/comment-ID.txt';
  writeOptions : any = {encrypt:false};
  userSession:any;
  canComment:boolean=false;
  public Editor = ClassicEditor;
  ckconfig = {
    placeholder: 'Type the comment here!',
    toolbar:  [ 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote','InsertTable','MediaEmbed','Undo', 'Redo' ]
  };
  
  @Output() closeComments = new EventEmitter();

  private _post: Post = null;
  
  @Input()
  set Post(post: Post) {
      this._post = post;
  }

  get Post(): Post {
      return this._post;
  }

  cancelComment(){
    this.closeComments.emit(null);
  }

  saveComment(){
    if(this.canComment){
      let p = Object.assign({},  this.form.value);
      this.ngxService.start();
      let fileContent = JSON.stringify(p.postContent);
      fileContent = fileContent.replace(/img src/g,"img style=\\\"max-width:100%\\\" src");
      let hash  = Md5.hashStr(new Date().toISOString(),false);

      let fileName = this.commentFileName.replace('ID', hash.toString());
      this.userSession.putFile(fileName,fileContent, this.writeOptions)
      .then(() =>{
        let comment = new PostComment();
        comment.fileName = fileName;
        comment.parentPostId = '0';
        comment.userId = this.userName;
        comment.postId = this.Post.id;
        comment.date= new Date().toISOString();
        this._api.add(comment)
        .subscribe(res => {
          comment.id= res.id;
          console.log('Comment id:' + res.id);
          this.ngxService.stop();
          this.toastr.success("Added comment!",'Success');      

          this.closeComments.emit(comment);

        }, error =>{
          console.log('Error to save comment to index');
          this.ngxService.stop();

        });

      })
      .catch((error)=>{
        console.log('Error saving comment');
        this.ngxService.stop();
      });

    }else{
      this.toastr.warning("You need to login to comment this Post!",'Warning');      

    }
  
    
  }

  constructor(private _api:ApiService, private ngxService: NgxUiLoaderService,private toastr:ToastrService) { 
    this._api.setApi("comments");
  }

  ngOnInit() {
    const appConfig = new blockstack.AppConfig(['store_write', 'publish_data'])
    this.userSession = new blockstack.UserSession({appConfig:appConfig});
    if(this.userSession.isUserSignedIn())
    {
      this.canComment = true;
      const userData = this.userSession.loadUserData();
      this.userName = userData.username;
    }
    else{
      this.canComment = false;
    }
    this.initializeForm();
  }

  initializeForm():void{
    this.postContent = new FormControl('', [Validators.required, Validators.maxLength(512)]);
    ClassicEditor.builtinPlugins.map( plugin => console.info( plugin.pluginName +",") );

    this.form = new FormGroup({
      postContent : this.postContent
    });

  }

}
