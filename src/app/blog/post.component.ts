import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import * as blockstack from 'node_modules/blockstack/dist/blockstack.js';
import { Md5 } from 'ts-md5/dist/md5';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-inline';
import CKEditorInspector from '@ckeditor/ckeditor5-inspector';
import { CustomUploaderAdapter } from './CKEditor/customUploaderAdapter';
import { NgxUiLoaderService } from 'ngx-ui-loader';



@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss']
})
export class PostComponent implements OnInit {
  
  readonly postsFileName:string = '/posts.txt';
  readonly postContentFileName:string = '/post-ID.txt';
  readonly postImageFileName:string = '/post-img-ID.txt';

  readOptions : any = {decrypt: false};
  writeOptions : any = {encrypt:false};
  userSession :any;
  postImageContent: string;
  posts:any;
  userName :string;  

  form :FormGroup;
  postTitle:FormControl;
  postContent:FormControl;
  
  editingPost:any;
  
  public Editor = ClassicEditor;
  ckconfig = {
    extraPlugins: [ this.CustomUploadAdapterPlugin ]
  };

  private _post: any = null;
  @Input()
  set Post(post: any) {
      this._post = post;
  }
  get Post(): any {
      return this._post;
  }

  @Output() closed = new EventEmitter<any>();

  CustomUploadAdapterPlugin(editor){
    editor.plugins.get( 'FileRepository' ).createUploadAdapter = ( loader ) => {
      // Configure the URL to the upload script in your back-end here!
      return new CustomUploaderAdapter( loader );
    };
  }

  constructor(private toastr:ToastrService, private ngxService: NgxUiLoaderService) { 
  
  }

  ngOnInit() {
    const appConfig = new blockstack.AppConfig(['store_write', 'publish_data'])
    this.userSession = new blockstack.UserSession({appConfig:appConfig});
    this.initializeForm();
    const userData = this.userSession.loadUserData();
    this.userName = userData.username;
    if (this.userSession.isUserSignedIn() && this.Post!=null) {
     this.ngxService.start();

      this.userSession.getFile(this.Post.postFileName,this.readOptions)
        .then((fileContents) => {
          this.editingPost = JSON.parse(fileContents);
          this.postTitle.setValue(this.editingPost.postTitle);
          this.postContent.setValue(this.editingPost.postContent);
          this.ngxService.stop();
        })
        .catch((error) => {
          console.log('Error loading post!');
          this.ngxService.stop();
        });
     } 

  }

  initializeForm():void{
    this.postTitle = new FormControl('', [Validators.maxLength(128), Validators.required]);
    this.postContent = new FormControl('', [Validators.required]);

    this.form = new FormGroup({
      postTitle : this.postTitle,
      postContent : this.postContent
    });

    //Edit 
      this.ngxService.start();
    this.userSession.getFile(this.postsFileName,this.readOptions)
      .then((fileContents) => {
        this.posts = JSON.parse(fileContents);
        if(this.posts == null)
          this.posts=new Array();
          this.ngxService.stop();
      })
      .catch((error)=>{
        console.log('Error loading post collection');
      });

  }

  save():void{
    this.ngxService.start();
    if(this.editingPost == null){ //New post
      if(this.posts == null)
      this.posts=new Array();

      
      let p = Object.assign({},  this.form.value);
      let hash  = Md5.hashStr(new Date().toISOString(),false);

      let div = document.createElement("div");
      div.innerHTML = this.postContent.value.substring(0,130);

      var postData = {
       // id: this.posts.length + 1,
        date: new Date().toISOString(),
        title:this.postTitle.value,
        excerpt:div.textContent,
        author: this.userName,
        postFileName: this.postContentFileName.replace('ID',hash.toString()) ,
        imageFileName:this.postImageFileName.replace('ID',hash.toString()) 
      };
      if(this.postImageContent == null || this.postImageContent == '')
        postData.imageFileName = null;
      this.posts.push(postData);
      
      let postContent = JSON.stringify(p);
      let postsArray = JSON.stringify(this.posts);
      this.userSession.putFile(this.postsFileName,postsArray, this.writeOptions)
      .then(() =>{
        this.userSession.putFile(postData.postFileName,postContent, this.writeOptions)
        .then(() =>{
          if(postData.imageFileName != null){
            this.userSession.putFile(postData.imageFileName,this.postImageContent, this.writeOptions)
            .then(() =>{
              this.toastr.success("The changes have been saved!",'Success');
              this.ngxService.stop();
              this.closed.emit(postData);  

            });
          }
          else{
            this.toastr.success("The changes have been saved!",'Success');
            this.ngxService.stop();

            this.closed.emit(postData);  
          }

        });
      
      })
      .catch((error)=>{
        console.log('Error saving changes');
        this.ngxService.stop();
      });
    }
    else{ //Edit post
      let p = Object.assign({},  this.form.value);
      
      let postResume = this.posts.filter(e => e.postFileName == this._post.postFileName );
      let div = document.createElement("div");
      div.innerHTML = this.postContent.value.substring(0,130);
      if(postResume.length==1){
        postResume = postResume[0];
        postResume.excerpt=div.textContent;
        postResume.title = p.postTitle;
      }
      let postsArray = JSON.stringify(this.posts);

      this.userSession.putFile(this.postsFileName,postsArray, this.writeOptions)
      .then(() =>{

      this.userSession.putFile(this._post.postFileName,  JSON.stringify(p), this.writeOptions)
      .then(() =>{
        if(this.postImageContent != null && this.postImageContent != ''){
          this.userSession.putFile(this._post.imageFileName,this.postImageContent, this.writeOptions)
          .then(() =>{
            this.toastr.success("The changes have been saved!",'Success');
            this.ngxService.stop();
            this.closed.emit(postResume);  
          });
        }
        else{
          this.toastr.success("The changes have been saved!",'Success');
          this.ngxService.stop();
          this.closed.emit(postResume);  
        }

      });
    })
    .catch((error)=>{
      console.log('Error updating post');
      this.ngxService.stop();
    });
    }
  }

  close():void{
    this.closed.emit(null);
  }

  handleInputChange(e) {
    var file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];

    var pattern = /image-*/;
    var reader = new FileReader();

    if (!file.type.match(pattern)) {
      this.toastr.error("Uploaded file is not a valid image. Only image files are allowed!",'Error');
      return;
    }


    reader.onload = this._handleReaderLoaded.bind(this);
    reader.readAsDataURL(file);
    
  }

  _handleReaderLoaded(e) {
    var reader = e.target;
    this.postImageContent =  reader.result;
    
  }


}


