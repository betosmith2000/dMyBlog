import { Component, OnInit } from '@angular/core';

import * as blockstack from 'node_modules/blockstack/dist/blockstack.js';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ApiService } from 'src/app/share/data-service';

import * as introJs from 'intro.js/intro.js';
import { Post } from 'src/app/blog/models/Post';
import { Router } from '@angular/router';
import { GlobalsService } from 'src/app/share/globals.service';
import { TranslateService } from '@ngx-translate/core';
import { SharedDataService } from 'src/app/share/shared-data.service';
import { ShareModel } from 'src/app/share/Models/share.model';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  introJS = introJs();
  selectedTheme:string ='dark';

  userName :string  = 'User name';
  readonly settingsFileName:string = '/settings.txt';
  //readonly avatarFileName:string = '/avatar.txt';
  readonly postsFileName:string = '/posts.txt';
  readonly postContentFileName:string = '/post-ID.txt';
  readonly postImageFileName:string = '/post-img-ID.txt';
  avatarURL:string = '';
  facebookURL:string='';
  twitterURL:string='';
  instagramURL:string='';
  hasPublicKey: boolean = false;

  readOptions : any = {decrypt: false};
  writeOptions : any = {encrypt:false};
  userSession :any;

  form : FormGroup;
  blogName : FormControl;
  blogDescription: FormControl;
  blogHeaderImage : FormControl;
  publicKey: FormControl;
  showSocialButtons:FormControl;
  postImageContent: string='';
  hasImageHeader:boolean=false;

  // avatarImage : FormControl;
  // avatarImageContent: string=' ';
  // hasAvatar:boolean=false;

  posts:Array<any> = new Array();

  isNewPost : boolean = false;
  isUpdatePost :boolean = false;
  selectedPost: any;
  shareablePost: any;
  isShowingTour :boolean=false;

  constructor(private toastr: ToastrService, private ngxService:NgxUiLoaderService, 
    private _api: ApiService, private route: Router, private globals: GlobalsService,
    private translate: TranslateService, public sharedDataService:SharedDataService) {
    this._api.setApi('posts')

    
  }
   
  setENTutorial(){
    
    this.introJS.setOptions({
      steps: [
        {
          intro: "Welcome to the configuration section, let's take a tour!"+
          "<br /><br />You can leave this tour at any time by clicking on the Skip button or outside this message box, you can also start it by clicking on the '?' Button."
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
 
  }

  
  setESTutorial(){
    
    this.introJS.setOptions({
      steps: [
        {
          intro: "Bienvenido a la sección de configuración, hagamos un recorrido!"+
          "<br /><br />Puede abandonar este recorrido en cualquier momento haciendo clic en el botón Skip o fuera de este cuadro de mensaje, también puede iniciarlo haciendo clic en ewl botón '?'."
        },
        {
          element: '#step0',
          intro: "Este es tu nombre de usuario"
        },
        {
          element: '#step1',
          intro: "El nombre, la descripción y la imagen son parte del encabezado de su blog, que se muestra cuando se comparte su blog o en el menú <strong> Mi blog </strong>.",
          disableInteraction:true
        },
        {
          element: '#step2',
          intro: "Debe guardar los cambios para verlos en el encabezado de su blog.",
          disableInteraction:true
        },
        {
          element: "#step3",
          intro: "Puede agregar una nueva publicación, solo presione este botón!",
          disableInteraction:true

        },
        {
          element: "#step4",
          intro: "Aquí está la lista de los posts que ha creado. Puede compartir<button type='button' class='btn btn-link btn-sm'><i class='fas fa-share-alt'></i></button>, editar<button type='button' class='btn btn-link btn-sm'><i class='far fa-edit'></i></button> or eliminar<button type='button' class='btn btn-link btn-sm'><i class='far fa-trash-alt'></i></button> cualquier post. ",
          disableInteraction:true
        },
      ]
    });
 
  }

  startTour(start:boolean) {
    var h = localStorage.getItem('dmyblog.globalHelp');
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

    if(this.translate.currentLang == 'es')
      this.setESTutorial();
    else 
      this.setENTutorial()

      
    this.introJS.start();
    this.introJS.onexit(x =>{
      let idx = this.posts.findIndex(e=> e.id == "example");
      if(idx!==-1)
        this.posts.splice(idx,1);
        
      this.isShowingTour=false;
      localStorage.setItem('dmyblog.globalHelp',"1");

    });
  }

  
  
  sharePost(event:Event, p:any){
    this.shareablePost = p;
  }

  
  ngOnInit() {
    this.selectedTheme= this.globals.getCurrentTheme();
    this.globals.getTheme().subscribe(theme=>{
      this.selectedTheme = theme;
    });

    this.initializeForm();
     this.publicKey.disable();
    this.userSession = new blockstack.UserSession()
    if (this.userSession.isUserSignedIn()) {
      this.ngxService.start();

      const userData = this.userSession.loadUserData();
      this.userName = userData.username;
      let avatarObj = userData.profile.image? userData.profile.image.filter(e=> e.name=='avatar')[0] : null;
      if(avatarObj!= null)
      {
        this.avatarURL = avatarObj.contentUrl;
      }
      else
        this.avatarURL = 'assets/User-blue-icon.png';

      let accounts = userData.profile.account;
      let facebookAccouunt = accounts? accounts.filter(e=> e.service=='facebook'):null;
      if(facebookAccouunt != null && facebookAccouunt.length>0){
        this.facebookURL = 'https://www.facebook.com/' + facebookAccouunt[0].identifier;
      }

      let twitterAccount = accounts? accounts.filter(e=> e.service=="twitter"):null;
      if(twitterAccount != null && twitterAccount.length>0){
        this.twitterURL = 'https://twitter.com/' + twitterAccount[0].identifier;
      }

      let instagramAccount = accounts? accounts.filter(e=> e.service=="instagram"):null;
      if(instagramAccount != null && instagramAccount.length>0){
        this.instagramURL  = 'https:///www.instagram.com/' + instagramAccount[0].identifier;
      }




      this.userSession.getFile(this.settingsFileName,this.readOptions)
        .then((fileContents) => {
          let data = JSON.parse(fileContents);
          if(data!= null ){
            this.blogName.setValue(data.blogName);
            this.blogDescription.setValue(data.blogDescription);
            this.blogHeaderImage.setValue(data.blogHeaderImage);
            this.publicKey.setValue(data.publicKey);
            this.showSocialButtons.setValue(data.showSocialButtons);
            
            if(data.blogHeaderImage)
            {
              this.hasImageHeader=true;
              this.postImageContent =   data.blogHeaderImage;
            }
            
            
            // this.userSession.getFile(this.avatarFileName,this.readOptions)
            // .then((avatarContent) => {
              // this.avatarImage.setValue(avatarContent)
              // if(avatarContent!= null && avatarContent != ' ')
              // {
              //   this.hasAvatar=true;
              //   this.avatarImageContent = avatarContent;
              // }
              // else{
              //   this.avatarURL = 'assets/User-blue-icon.png';
              // }

              this.userSession.getFile(this.globals.publicKeyFileName,this.readOptions)
              .then((publickeyContent) => {
                if(publickeyContent && publickeyContent != ' '){
                  this.publicKey.setValue(publickeyContent);
                  this.hasPublicKey = true;
                }
                else{
                  this.publicKey.setValue(" ");
                  this.hasPublicKey = false;
                }
  
              }); 

              
              this.userSession.getFile(this.postsFileName,this.readOptions)
              .then((postContents) => {
                this.posts = JSON.parse(postContents);
                if(this.posts == null)
                  this.posts = new Array();
                this.ngxService.stop();
                
                this.startTour(false);

                this.sharedDataService.getSharedContent();
  
              }); 
           
            // });
          

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
    this.publicKey = new FormControl(' ');
    //this.avatarImage = new FormControl('');
    this.showSocialButtons = new FormControl(false);


    this.form = new FormGroup({
      blogName : this.blogName,
      blogDescription : this.blogDescription,
      blogHeaderImage : this.blogHeaderImage,
      //avatarImage: this.avatarImage,
      publicKey:this.publicKey,
      showSocialButtons:this.showSocialButtons
    });
  }

  save(){
    let p = Object.assign({},  this.form.value);
    let str = JSON.stringify(p);
   // p.avatarImage='';
    p.publicación='';

    this.ngxService.start();
    
    this.userSession.putFile(this.settingsFileName,str, this.writeOptions)
      .then(() =>{
        
        // if(!this.avatarImageContent)
        //   this.avatarImageContent = ' ';
        // this.userSession.putFile(this.avatarFileName, this.avatarImageContent, this.writeOptions)
        // .then(() =>{
          this.userSession.putFile(this.globals.publicKeyFileName, this.publicKey.value, this.writeOptions)
          .then(() =>{
            this.ngxService.stop();
            this.toastr.success("The changes have been saved!",'Success')
            this.route.navigate(['blog/' +this.userName]);
          })
          .catch((error)=>{
            console.log('Errro updating settings');
            this.ngxService.stop();
          });

        })
        .catch((error)=>{
          console.log('Errro updating settings');
          this.ngxService.stop();
        });
    // })
    // .catch((error)=>{
    //   console.log('Errro updating settings');
    //   this.ngxService.stop();
    // });

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

  
  // handleAvatarInputChange(e) {
  //   var file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];

  //   var pattern = /image-*/;
  //   var reader = new FileReader();

  //   if (!file.type.match(pattern)) {
  //       alert('invalid format');
  //       return;
  //   }


  //   reader.onload = this._handleAvatarReaderLoaded.bind(this);
  //   reader.readAsDataURL(file);

  // }


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

  
  // _handleAvatarReaderLoaded(e) {
  //   var reader = e.target;
  //   this.avatarImage.setValue( reader.result);
  //   this.avatarImageContent=reader.result;
  //   this.hasAvatar = true;
  // }

  
  // removeAvatarImageHeader():void{
  //   this.avatarImage.setValue("");
  //   this.avatarImageContent=null;
  //   this.hasAvatar = false;

  // }



  showNewPost():void{
    this.selectedPost = null;
    this.isNewPost = true;
    this.isUpdatePost=false;
  }

  deletePost(p:any):void{
    let idx = this.posts.findIndex(e=> e.shareCode == p.shareCode);
    let deleteQ = "";
    if(this.translate.currentLang == 'es')
      deleteQ = '¿Esta seguro de que quiere eliminar este post?'
    else 
      deleteQ = 'Are you sure you want to delete this post?'

    if(confirm(deleteQ)){
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

      this.userSession.deleteFile(p.postFileName);
      if(p.imageFileName){
        this.userSession.deleteFile(p.imageFileName).
          then(()=>{
            this.toastr.success("The post was delete!",'Success')    
          });
      }
      else{
        this.toastr.success("The post was delete!",'Success')
      }
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
      this.selectedPost.status = res.status;
      this.selectedPost.encrypt = res.encrypt;
      this.selectedPost.id=res.id;
    }
    this.isNewPost = false;
    this.isUpdatePost=false;

  }

  showPublicKey(){
    const userData = this.userSession.loadUserData();
    
    var pk = userData.appPrivateKey;
    var privK = blockstack.hexStringToECPair(pk).publicKey.toString('hex')
    this.publicKey.setValue(privK);
    this.hasPublicKey = true;
  }

  hidePublicKey(){
  
    this.publicKey.setValue(" ")
    this.hasPublicKey = false;
  }

  viewPrivatePost(event:Event, sharePost: ShareModel){
    event.preventDefault();
    this.route.navigate(['/private-read/'+sharePost.source+"/"+sharePost.fileName]);
  }

  deletePrivatePost(event:Event, sharePost: ShareModel){
    event.preventDefault();
    let deleteQ = "";

    if(this.translate.currentLang == 'es')
      deleteQ = '¿Esta seguro de que quiere eliminar este post privado compartido?'
    else 
      deleteQ = 'Are you sure you want to delete this shared private post?'

    if(confirm(deleteQ)){
    this.sharedDataService.deletePost(sharePost);
    }

  }

  launchSocial(url:string){
    if(url==null || url == ''){
      
    }
    else{
      window.open(url, '_blank');
    }

  }
}
