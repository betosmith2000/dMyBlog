import { Component, OnInit } from '@angular/core';

import * as blockstack from 'node_modules/blockstack/dist/blockstack.js';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ApiService } from 'src/app/share/data-service';

import * as introJs from 'intro.js/intro.js';
import { Post } from 'src/app/blog/models/Post';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  introJS = introJs();

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
  postImageContent: string='';
  hasImageHeader:boolean=false;

  posts:Array<any> = new Array();

  isNewPost : boolean = false;
  isUpdatePost :boolean = false;
  selectedPost: any;
  shareablePost: any;
  isShowingTour :boolean=false;
  constructor(private toastr: ToastrService, private ngxService:NgxUiLoaderService, private _api: ApiService, private route: Router) {}
   
  startTour(start:boolean) {
    var h = localStorage.getItem('dmyblog.settingsHelp');
    if(h=="1" && !start)
      return;

    this.isShowingTour=true;
    if(this.posts.length==0){
      let pEx = new Post();
      pEx.id="example";
      pEx.title="Example title post!";
      pEx.date=new Date().toISOString();
      this.posts.push(pEx);
    }
    this.introJS.setOptions({
      steps: [
        {
          intro: "Welcome to the configuration section, let's take a tour!"
        },
        {
          element: '#step0',
          intro: "This is your username"
        },
        {
          element: '#step1',
          intro: "The name, description and image are part of the header of your blog, which is displayed when you share your blog or in the <strong>My Blog</strong> menu.",
          disableInteraction:true
        },
        {
          element: '#step2',
          intro: "You need to save the changes to see them in the header of your blog.",
          disableInteraction:true
        },
        {
          element: "#step3",
          intro: "You can add a new Post, just press the button!",
          disableInteraction:true

        },
        {
          element: "#step4",
          intro: "Here is the list of the posts that you have created. You can share<button type='button' class='btn btn-link btn-sm'><i class='fas fa-share-alt'></i></button>, edit<button type='button' class='btn btn-link btn-sm'><i class='far fa-edit'></i></button> or delete<button type='button' class='btn btn-link btn-sm'><i class='far fa-trash-alt'></i></button> them. ",
          disableInteraction:true
        },
      ]
    });
 
    this.introJS.start();
    this.introJS.onexit(x =>{
      let idx = this.posts.findIndex(e=> e.id == "example");
      if(idx!==-1)
        this.posts.splice(idx,1);
        
      this.isShowingTour=false;
      localStorage.setItem('dmyblog.settingsHelp',"1");

    });
  }

  
  
  sharePost(event:Event, p:any){
    this.shareablePost = p;
  }

  
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
          if(data!= null ){
            this.blogName.setValue(data.blogName);
            this.blogDescription.setValue(data.blogDescription);
            this.blogHeaderImage.setValue(data.blogHeaderImage);
            if(data.blogHeaderImage)
            {
              this.hasImageHeader=true;
              this.postImageContent =   data.blogHeaderImage;
            }

          this.userSession.getFile(this.postsFileName,this.readOptions)
            .then((postContents) => {
              this.posts = JSON.parse(postContents);
              if(this.posts == null)
                this.posts = new Array();
              this.ngxService.stop();
              
              this.startTour(false);

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
        this.route.navigate(['blog/' +this.userName]);

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
    this.postImageContent=reader.result;
    this.hasImageHeader = true;
  }

  
  removeImageHeader():void{
    this.blogHeaderImage.setValue("");
    this.postImageContent=null;
    this.hasImageHeader = false;

  }



  showNewPost():void{
    this.selectedPost = null;
    this.isNewPost = true;
    this.isUpdatePost=false;
  }

  deletePost(p:any):void{
    let idx = this.posts.findIndex(e=> e.shareCode == p.shareCode);
    if(confirm('Are you sure you want to delete this post?')){
      this.ngxService.start();
      this.posts.splice(idx,1);

      if(p.id.length == 24)
      {
        this._api.delete(p.id)
        .subscribe(res => {
          this.saveFiles(p);
          console.log('Delete discoverable Post id:' + p.id);
        }, error =>{
          console.log('Error to save post to index');
          this.ngxService.stop();

        });
      }
      else{
        this.saveFiles(p);
      }

    }
  }


  saveFiles(p:any):void{
    let postsArray = JSON.stringify(this.posts);

    this.userSession.putFile(this.postsFileName,postsArray, this.writeOptions)
    .then(() =>{

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

      this.ngxService.stop();
    }).catch((error) => {
      console.log('Error deleting post!')
      this.ngxService.stop();
    });

  }


  editPost(p:any):void{
    this.selectedPost = p;
    this.isNewPost = false;
    this.isUpdatePost = true;
  }


  onClosed(res: any): void {

    if(res && this.isNewPost)
    {
      this.posts.push(res);
    }
    else if(res){
      this.selectedPost.title = res.title;
      this.selectedPost.id=res.id;
    }
    this.isNewPost = false;
    this.isUpdatePost=false;

  }


}
