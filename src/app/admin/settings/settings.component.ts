import { Component, OnInit } from '@angular/core';

import * as blockstack from 'node_modules/blockstack/dist/blockstack.js';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';


@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  userName :string  = 'User name';
  readonly settingsFileName:string = '/settings.txt';
  readonly postsFileName:string = '/posts.txt';
  readonly postContentFileName:string = '/post-ID.txt';
  readonly postImageFileName:string = '/post-img-ID.txt';

  readOptions : any = {decrypt: false};
  writeOptions : any = {encrypt:false};
  userSession :any;

  form : FormGroup;
  blogName : FormControl;
  blogDescription: FormControl;
  blogHeaderImage : FormControl;

  posts:Array<any> = new Array();

  isNewPost : boolean = false;
  selectedPost: any;

  constructor(private toastr: ToastrService, private ngxService:NgxUiLoaderService) { }

  ngOnInit() {
    
    this.initializeForm();
    this.userSession = new blockstack.UserSession()
    if (this.userSession.isUserSignedIn()) {
      this.ngxService.start();

      const userData = this.userSession.loadUserData();
      this.userName = userData.username;
    
      this.userSession.getFile(this.settingsFileName,this.readOptions)
        .then((fileContents) => {
          let data = JSON.parse(fileContents);
          if(data!= null && data.blogName){
            this.blogName.setValue(data.blogName);
            this.blogDescription.setValue(data.blogDescription);
            this.blogHeaderImage.setValue(data.blogHeaderImage);

            
          this.userSession.getFile(this.postsFileName,this.readOptions)
            .then((postContents) => {
              this.posts = JSON.parse(postContents);
              if(this.posts == null)
                this.posts = new Array();
              this.ngxService.stop();              
            });
          
          }
          else{
            this.ngxService.stop();
          }
        })
        .catch((error)=>{
          console.log('Error reading settings');
          this.ngxService.stop();
          
        });
     } 

     
  }

  initializeForm():void{
    this.blogName = new FormControl('', [Validators.maxLength(64)]);
    this.blogDescription = new FormControl('', [Validators.maxLength(1024)]);
    this.blogHeaderImage = new FormControl('');

    this.form = new FormGroup({
      blogName : this.blogName,
      blogDescription : this.blogDescription,
      blogHeaderImage : this.blogHeaderImage
    });
  }

  save(){
    let p = Object.assign({},  this.form.value);
    let str = JSON.stringify(p);
    this.ngxService.start();
    this.userSession.putFile(this.settingsFileName,str, this.writeOptions)
      .then(() =>{
        this.ngxService.stop();
        this.toastr.success("The changes have been saved!",'Success')  
    })
    .catch((error)=>{
      console.log('Errro updating settings');
      this.ngxService.stop();
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
    this.blogHeaderImage.setValue( reader.result);
    
  }

  showNewPost():void{
    this.selectedPost = null;
    this.isNewPost = true;
  }
  
  deletePost(p:any):void{
    let idx = this.posts.findIndex(e=> e.id == p.id);
  if(confirm('Are you sure you want to delete this post?')){
      this.ngxService.start();
      this.posts.splice(idx,1);
      let postsArray = JSON.stringify(this.posts);

      this.userSession.putFile(this.postsFileName,postsArray, this.writeOptions)
      .then(() =>{
       // this.toastr.success("The post was delete!",'Success')  
        
        //TODO:Uncomment when delete feature avaliable
        //this.userSession.deleteFile(p.postFileName);
        //if(p.imageFileName)
        //  this.userSession.deleteFile(p.imageFileName);

        //TODO: Comment when delete feature avaliable
        this.userSession.putFile(p.postFileName,  'Deleted!', this.writeOptions)
        .then(() =>{
          if(p.imageFileName != null && p.imageFileName != ''){
            this.userSession.putFile(p.imageFileName,'Deleted!', this.writeOptions)
            .then(() =>{
              this.toastr.success("The post was delete!",'Success')        
              this.ngxService.stop();
              
            });
          }
          else{
            this.toastr.success("The post was delete!",'Success')  
            this.ngxService.stop();
          }
  
        }) 
        .catch((error)=>{
          console.log('Error deleting post');
          this.ngxService.stop();
        });;
      
      });
    }
  }

  editPost(p:any):void{
    this.selectedPost = p;
    this.isNewPost = true;
  }


  onClosed(res: any): void {
    this.isNewPost = false;
    if(res)
    {
      this.posts.push(res);
    }
   
  }


}
