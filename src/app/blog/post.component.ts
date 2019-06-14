import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import * as blockstack from 'node_modules/blockstack/dist/blockstack.js';
import { Md5 } from 'ts-md5/dist/md5';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-inline';
import CKEditorInspector from '@ckeditor/ckeditor5-inspector';
import { CustomUploaderAdapter } from './CKEditor/customUploaderAdapter';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ApiService } from '../share/data-service';
import { NameValue } from '../share/name-value';
import { Post } from './models/Post';



@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss']
})
export class PostComponent implements OnInit {
  
  readonly postsFileName:string = '/posts.txt';
  readonly postContentFileName:string = '/post-ID.txt';
  readonly postImageFileName:string = '/post-img-ID.txt';
  title :string = "New Post";
  readOptions : any = {decrypt: false};
  writeOptions : any = {encrypt:false};
  userSession :any;
  postImageContent: string='';
  posts:any;
  userName :string;  
  hasImageHeader:boolean=false;

  form :FormGroup;
  postTitle:FormControl;
  postContent:FormControl;
  status:FormControl;
  
  editingPost:any;
  catStatus: NameValue[];

  public Editor = ClassicEditor;
  ckconfig = {
    extraPlugins: [ this.CustomUploadAdapterPlugin ],
    toolbar :{
      viewportTopOffset : 90
    }
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

  constructor(private toastr:ToastrService, private ngxService: NgxUiLoaderService, private _api:ApiService) { 
  
  }

  ngOnInit() {
    this.hasImageHeader=false;
    this.catStatus = [
      new NameValue(0, 'Private'),
      new NameValue(1, 'Public'),
      new NameValue(2, 'Browseable')
    ];
    this._api.setApi('Posts');
    const appConfig = new blockstack.AppConfig(['store_write', 'publish_data'])
    this.userSession = new blockstack.UserSession({appConfig:appConfig});
    this.initializeForm();
    const userData = this.userSession.loadUserData();
    this.userName = userData.username;
    if (this.userSession.isUserSignedIn() && this.Post!=null) {
      this.title ="Update Post";
      this.ngxService.start();

      this.userSession.getFile(this.Post.postFileName,this.readOptions)
        .then((fileContents) => {
          this.editingPost = JSON.parse(fileContents);
          this.postTitle.setValue(this.editingPost.postTitle);
          this.postContent.setValue(this.editingPost.postContent);
          let statusPost = this.editingPost.status?this.editingPost.status:0;
          this.status.setValue(statusPost);
          if(this.Post.imageFileName){
            this.hasImageHeader=true;

            this.userSession.getFile(this.Post.imageFileName,this.readOptions)
              .then((imagefileContents) => {
                this.postImageContent = imagefileContents;
                this.ngxService.stop();
              })
              .catch((error) => {
                console.log('Error loading image header!');
                this.ngxService.stop();
              });
          }
          else{
            this.ngxService.stop();
          }
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
    this.status = new FormControl('', [Validators.required]);

    this.form = new FormGroup({
      postTitle : this.postTitle,
      postContent : this.postContent,
      status:this.status
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
      
      let hash  = Md5.hashStr(new Date().toISOString(),false);

      let div = document.createElement("div");
      div.innerHTML = this.postContent.value.substring(0,130);

      var postData:Post = {
        id: '',
        date: new Date().toISOString(),
        title:this.postTitle.value,
        excerpt:div.textContent,
        author: this.userName,
        postFileName: this.postContentFileName.replace('ID',hash.toString()) ,
        imageFileName:this.postImageFileName.replace('ID',hash.toString()) ,
        status: this.status.value,
        shareCode: hash.toString(),
        Interaction:null
      };
      if(this.postImageContent == null || this.postImageContent == '')
        postData.imageFileName = null;
      this.posts.push(postData);

      if(this.status.value != 0){ //discoverable
      //save to index
        this._api.add(postData)
          .subscribe(res => {
            postData.id= res.id;
            this.saveFiles(postData);
            console.log('Post id:' + postData.id);
          }, error =>{
            console.log('Error to save post to index');
            this.ngxService.stop();

          });
      }
      else{
       // postData.id= hash.toString();
        this.saveFiles(postData);
      }

    }
    else{ //Edit post
      
      let postResume = this.posts.filter(e => e.postFileName == this._post.postFileName );
      let div = document.createElement("div");
      div.innerHTML = this.postContent.value.substring(0,130);

    

      if(postResume.length==1){
        postResume = postResume[0];
        postResume.excerpt=div.textContent;
        postResume.title = this.postTitle.value;
        postResume.status =  this.status.value;
      }
      
      if(this.postImageContent != null && this.postImageContent != "" && postResume.imageFileName == null)
        postResume.imageFileName = this.postImageFileName.replace('ID', postResume.shareCode) ;
      else if(this.postImageContent==null || this.postImageContent=="")
        postResume.imageFileName = null;

      if(this.status.value == 2 || this.status.value ==1 ){ //discoverable
        //save to index, if not created yet!
        if(postResume.id.length != 24){
          //postResume.id="";
          this._api.add(postResume)
            .subscribe(res => {
              postResume.id= res.id;
              this.saveFiles(postResume);
              console.log('Post id:' + postResume.id);
            }, error =>{
              console.log('Error to save post to index');
              this.ngxService.stop();

            });
          }
          else{ //Update index
            this._api.update(postResume.id, postResume)
            .subscribe(res => {
              this.saveFiles(postResume);
              console.log('Post id:' + postResume.id);
            }, error =>{
              console.log('Error to save post to index');
              this.ngxService.stop();

            });
          }
        }
        else{
          //Delete post from discoverable if apply
          if(postResume.id.length == 24){
          this._api.delete(postResume.id)
            .subscribe(res => {
              console.log('Delete discoverable Post id:' + postResume.id);
              //postResume.id="";
              this.saveFiles(postResume);
            }, error =>{
              console.log('Error to save post to index');
              this.ngxService.stop();

            });
          }
          else{
            this.saveFiles(postResume);
          }
        }
   
    }
  }

  saveFiles(postData:Post):void{
    let p = Object.assign({},  this.form.value);

    let postsArray = JSON.stringify(this.posts);
    let postContent = JSON.stringify(p);

    this.userSession.putFile(this.postsFileName,postsArray, this.writeOptions)
    .then(() =>{
      postContent = postContent.replace(/img src/g,"img style=\\\"max-width:100%\\\" src");
      this.userSession.putFile(postData.postFileName,postContent, this.writeOptions)
      .then(() =>{
        if(postData.imageFileName != null && this.postImageContent){          
          this.userSession.putFile(postData.imageFileName,this.postImageContent, this.writeOptions)
          .then(() =>{
            this.toastr.success("The changes have been saved!",'Success');
            this.ngxService.stop();
            this.closed.emit(postData);  

          })
          .catch((error)=>{
            console.log('Error saving image changes');
            this.ngxService.stop();
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
    this.hasImageHeader = true;
    
  }

  removeImageHeader():void{
    if(this.Post!= null && this.Post.imageFileName){
      this.Post.imageFileName=null;
      this.postImageContent = null;
      // this.userSession.putFile(this.Post.imageFileName,'Deleted!', this.writeOptions)
      // .then(() =>{
      //   this.Post.imageFileName=null;
      // })
      // .catch((error)=>{
      //   console.log('Error saving image changes');
      // });
    }
    this.postImageContent=null;
    this.hasImageHeader = false;

  }

}


