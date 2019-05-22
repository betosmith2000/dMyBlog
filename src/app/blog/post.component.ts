import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import * as blockstack from 'node_modules/blockstack/dist/blockstack.js';
import { Md5 } from 'ts-md5/dist/md5';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-inline';
import CKEditorInspector from '@ckeditor/ckeditor5-inspector';


class CustomUploaderAdapter {
  loader;

  constructor( loader){
      debugger;
      this.loader = loader;
  }

  upload(){
      // return this.loader.file.then(file => {
      //     debugger;
      // });
      return new Promise((resolve, reject) => {
          console.log('UploadAdapter upload called', this.loader);
          console.log('the file we got was', this.loader.file);
          resolve({ default: 'data:image/jpeg;base64,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' });
        });
  }

  abort(){
      debugger;
  }

}

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

  constructor(private toastr:ToastrService) { 
  //   this.Editor.create( 
  //     document.querySelector( '#editor' ), {
  //     extraPlugins: [ CustomUploadAdapterPlugin ]
  //  } 
  //   ).
  //   then(editor => {
  //     CKEditorInspector.attach( editor );
  //   })
  //   .catch( error => {
  //       console.log( error );
  //   } );
  }

  ngOnInit() {
    const appConfig = new blockstack.AppConfig(['store_write', 'publish_data'])
    this.userSession = new blockstack.UserSession({appConfig:appConfig});
    this.initializeForm();
    const userData = this.userSession.loadUserData();
    this.userName = userData.username;
    if (this.userSession.isUserSignedIn() && this.Post!=null) {
     

      this.userSession.getFile(this.Post.postFileName,this.readOptions)
        .then((fileContents) => {
          this.editingPost = JSON.parse(fileContents);
          this.postTitle.setValue(this.editingPost.postTitle);
          this.postContent.setValue(this.editingPost.postContent);
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
      
    this.userSession.getFile(this.postsFileName,this.readOptions)
      .then((fileContents) => {
        this.posts = JSON.parse(fileContents);
        if(this.posts == null)
          this.posts=new Array();
      });
  }

  save():void{
    if(this.editingPost == null){ //New post
      if(this.posts == null)
      this.posts=new Array();

      
      let p = Object.assign({},  this.form.value);
      let hash  = Md5.hashStr(new Date().toISOString(),false);

      let div = document.createElement("div");
      div.innerHTML = this.postContent.value.substring(0,130);

      var postData = {
        id: this.posts.length + 1,
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
              this.closed.emit(postData);  
            });
          }
          else{
            this.toastr.success("The changes have been saved!",'Success');
            this.closed.emit(postData);  
          }

        });
      
      });
    }
    else{ //Edit post

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


