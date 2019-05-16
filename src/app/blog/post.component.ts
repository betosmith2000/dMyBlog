import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import * as blockstack from 'node_modules/blockstack/dist/blockstack.js';
import { Md5 } from 'ts-md5/dist/md5';

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
  postImage: string;
  posts:any;
  

  form :FormGroup;
  postTitle:FormControl;
  postContent:FormControl;
  

  constructor(private toastr:ToastrService) { }

  ngOnInit() {
    this.initializeForm();
    this.userSession = new blockstack.UserSession()
    if (this.userSession.isUserSignedIn()) {

    
      this.userSession.getFile(this.postsFileName,this.readOptions)
        .then((fileContents) => {
          this.posts = JSON.parse(fileContents);
          if(this.posts == null)
            this.posts=new Array();
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
  }

  save():void{
    debugger
    if(this.posts == null)
    this.posts=new Array();

    
    let p = Object.assign({},  this.form.value);
    let hash  = Md5.hashStr(new Date().toISOString(),false);
    var postData = {
      id: this.posts.length + 1,
      date: new Date().toISOString(),
      title:this.postTitle.value,
      excerpt:this.postContent.value.substring(0,100),
      postFile: this.postContentFileName.replace('ID',hash.toString()) ,
      imageFile:this.postImageFileName.replace('ID',hash.toString()) 
    };
    this.posts.push(postData);
    
    let str = JSON.stringify(p);
    let strPosts = JSON.stringify(this.posts);
    this.userSession.putFile(this.postsFileName,strPosts, this.writeOptions)
    .then(() =>{
      this.userSession.putFile(this.postImageFileName,this.postImage, this.writeOptions)
      .then(() =>{
        this.userSession.putFile(this.postContentFileName,str, this.writeOptions)
        .then(() =>{
          this.toastr.success("The changes have been saved!",'Success')  
        });
      });
    
    });
  }

  
  handleInputChange(e) {
    var file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];

    var pattern = /image-*/;
    var reader = new FileReader();

    if (!file.type.match(pattern)) {
        alert('invalid format');
        return;
    }


    reader.onload = this._handleReaderLoaded.bind(this);
    reader.readAsDataURL(file);
    
  }

  _handleReaderLoaded(e) {
    var reader = e.target;
    this.postImage =  reader.result;
    
  }


}
