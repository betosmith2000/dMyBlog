import { Component, OnInit } from '@angular/core';
import * as blockstack from 'node_modules/blockstack/dist/blockstack.js';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ApiService } from '../share/data-service';
import { Post } from './models/Post';
import { InteractionTypeResult } from './models/InteractionTypeResult';
import * as introJs from 'intro.js/intro.js';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { GlobalsService } from '../share/globals.service';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss']
})
export class BlogComponent implements OnInit {
  introJS = introJs();
  isShowingTour :boolean=false;
  isSharingPost : boolean = false;
  showSocialButtons : boolean=false;
  // avatarContent:string;
  // hasAvatar :boolean = false;

  avatarURL:string = '';
  facebookURL:string='';
  twitterURL:string='';
  instagramURL:string='';


  header :any;
  userSession :any;
  userName :string  = '';
  postId:string = null;
  image :string ="";
  readonly settingsFileName:string = '/settings.txt';
  readOptions : any = {decrypt: false, username: null};
  writeOptions : any = {encrypt:false};
  isAdmin : boolean = false;
  isNewPost : boolean = false;
  isViewingPost : boolean = false;
  private LOGO = require("../../assets/post-head.jpg");
  selectedPost: Post;
  shareTitle : string = 'Share this ';

  readonly postsFileName:string = '/posts.txt';
  readonly postContentFileName:string = '/post-ID.txt';
  readonly postImageFileName:string = '/post-img-ID.txt';
  //readonly avatarFileName:string = '/avatar.txt';

  posts:any = new Array();

  

  constructor(private toastr: ToastrService, private route:ActivatedRoute, 
    private ngxService: NgxUiLoaderService, private _api: ApiService,
    private translate: TranslateService, private router: Router,
    private globals: GlobalsService) { 
   
  }
  
  
  // getAvatar():void {
  //   this.readOptions.decrypt = false;
  //   this.userSession.getFile(this.avatarFileName,this.readOptions)
  //   .then((imageContent) => {
  //     if(imageContent){
  //       this.avatarContent= imageContent;
  //       this.hasAvatar = true;
  //     }
  //     else 
  //     this.hasAvatar = false;
  //   })
  //   .catch((error)=>{
  //     console.log('Error reading image');
      
  //   });
    
  // }


  setENTutorial(){
    this.introJS.setOptions({    
      steps: [
        {
          intro: "Welcome to <strong>My Blog</strong> section, let's take a tour!" +
          "<br /><br />You can leave this tour at any time by clicking on the Skip button or outside this message box, you can also start it by clicking on the '?' Button."
        },
        {
          element: '#step1',
          intro: "This is the header of your blog, you can customize it in the configuration section by clicking on the user name of the menu. This is how it will look when you share the link to your blog.",
          disableInteraction:true
        },
        {
          element: '#step2',
          intro: "With this button you can share your blog through a link, Twitter, LinkedIn or Facebook.",
          disableInteraction:true
        },
        {
          element: "#step3",
          intro: "You can add a new Post, just press the button!",
          disableInteraction:true

        },
        {
          element: "#step4",
          intro: "<p>Here is the list of the posts that you have created." +
          " You can view<button type='button' class='btn btn-link btn-sm'><i class='far fa-eye'></i></button>,"+
          " share<button type='button' class='btn btn-link btn-sm'><i class='fas fa-share-alt'></i></button>,"+
          " edit<button type='button' class='btn btn-link btn-sm'><i class='far fa-edit'></i></button> or"+
          " delete<button type='button' class='btn btn-link btn-sm'><i class='far fa-trash-alt'></i></button> them.</p> "+
          " <p>You can also see if your post has liked to readers<button type='button' class='btn btn-link btn-sm'><i class='far fa-thumbs-up'></i></button></p>",
          //" or not<button type='button' class='btn btn-link btn-sm'><i class='fas fa-grin-hearts'></i></button>.</p>",
          position:"top",
          disableInteraction:true

        }
      ]
    });
  }

  setESTutorial(){
    this.introJS.setOptions({    
      steps: [
        {
          intro: "Bienvenido a la sección <strong> Mi blog </strong>, ¡hagamos un recorrido!" +
          "<br /><br />Puede abandonar este recorrido en cualquier momento haciendo clic en el botón Skip o fuera de este cuadro de mensaje, también puede iniciarlo haciendo clic en en el botón '?'."
        },
        {
          element: '#step1',
          intro: "Este es el encabezado de su blog, puede personalizarlo en la sección de configuración haciendo clic en el nombre de usuario del menú. Así es como se verá cuando comparta el enlace a su blog.",
          disableInteraction:true
        },
        {
          element: '#step2',
          intro: "Con este botón puede compartir su blog a través de un enlace, Twitter, LinkedIn o Facebook.",
          disableInteraction:true
        },
        {
          element: "#step3",
          intro: "Puede agregar una nuevo post, solo presiona el botón.",
          disableInteraction:true

        },
        {
          element: "#step4",
          intro: "<p>Aquí está la lista de los posts que ha creado." +
          " Puede ver<button type='button' class='btn btn-link btn-sm'><i class='far fa-eye'></i></button>,"+
          " compartit<button type='button' class='btn btn-link btn-sm'><i class='fas fa-share-alt'></i></button>,"+
          " editar<button type='button' class='btn btn-link btn-sm'><i class='far fa-edit'></i></button> o"+
          " eliminar<button type='button' class='btn btn-link btn-sm'><i class='far fa-trash-alt'></i></button> cualquier post.</p> "+
          " <p>También puede ver si su publicación ha gustado a los lectores<button type='button' class='btn btn-link btn-sm'><i class='far fa-thumbs-up'></i></button></p>",
          
          position:"top",
          disableInteraction:true

        }
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
      pEx.status =2;
      this.getPostImage(pEx);
      this.getInteractions(pEx);
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


  ngOnInit() {
    this._api.setApi('Posts');
   
    

    const appConfig = new blockstack.AppConfig(['store_write', 'publish_data'])
    this.userSession = new blockstack.UserSession({appConfig:appConfig});
    this.route.paramMap.subscribe(params => {
      this.ngxService.start(); 

      let userBlog = params.get("userBlog");
      this.userName = userBlog;
      if(!this.userSession.isUserSignedIn())
      {
        
        this.isAdmin = false;
      }
      else{
        const userData = this.userSession.loadUserData();
        if(this.userName==null || this.userName.trim() ==''){
          this.userName = userData.username;
        }
        if(this.userSession.isUserSignedIn() && this.userName == userData.username)
          this.isAdmin = true;
        else 
          this.isAdmin = false;
      }
      
      this.readOptions.username = this.userName;
      this.getProfileData();
      //this.getAvatar();
      
      this.userSession.getFile(this.settingsFileName,this.readOptions)
        .then((fileContents) => {
          this.header = JSON.parse(fileContents);
          this.image = this.header ? this.header.blogHeaderImage: null;
          if(this.header){
            this.header.blogName =  this.header.blogName!=null && this.header.blogName!= ""?  this.header.blogName : "Sample blog name";
            this.header.blogDescription = this.header.blogDescription!= null &&  this.header.blogDescription!= ""? this.header.blogDescription :"Sample blog description";
          }
          this.showSocialButtons = this.header.showSocialButtons;
          this.userSession.getFile(this.postsFileName,this.readOptions)
          .then((postContents) => {
            let allPosts = JSON.parse(postContents);
            if(!this.isAdmin)
              this.posts = allPosts.filter(e=> e.status != "0");
            else
              this.posts=allPosts;
            if(this.posts == null)
              this.posts = new Array();
            this.posts.forEach(p => {
              p.imageFileContent = null;
              this.getPostImage(p);
              this.getInteractions(p);
            });
            this.ngxService.stop();
            this.startTour(false);
            
          })
          .catch((error) => {
            console.log('Error reading post collection!')
            this.ngxService.stop();
          });;

        })
        .catch((error) => {
          console.log('Error reading settings!')
          this.ngxService.stop();
      });
    });

    
  }
  getInteractions(post:any){
    if(post.status>0){
      let p = "postId=" + post.id + "&userId=" + post.author;
      this._api.setApi('Interactions');
      this._api.getAll<InteractionTypeResult>(p).subscribe(d => {
        post.Interaction = d;
        this.ngxService.stop();
      }, err => {
        this.ngxService.stop();
        console.log('Error loading interactions');
      });
    }
  }
  getPostImage(p:any):void {
    
      this.readOptions.decrypt=p.encrypt;
    
    if(p.imageFileName== null || p.imageFileName=='')
      p.imageFileContent= this.LOGO;
    else 
    {
      this.userSession.getFile(p.imageFileName,this.readOptions)
      .then((imageContent) => {
        p.imageFileContent= imageContent;
      });
    }
  }

  showNewPost():void{
    this.selectedPost = null;
    this.isNewPost = true;
  }
  
  viewPost(p:Post){
    //this.selectedPost = p;
    //this.isViewingPost =true;
    if(this.isSharingPost){
      this.isSharingPost = false;
      return;
    }
    if(p.id)
      this.router.navigate(['/read/' + p.author + '/' + p.id])
    else
      this.router.navigate(['/read/' + p.author + '/' + p.shareCode])
  }

  
  onClosed(res: any): void {
    this.isNewPost = false;
    if(res)
    {    
      let postResume = this.posts.filter(e => e.postFileName == res.postFileName );
      if(postResume.length==1){ //edit
        postResume = postResume[0];
        postResume.excerpt=res.excerpt;
        postResume.title = res.title;
        postResume.status = res.status;
        postResume.id = res.id;
        postResume.imageFileName = res.imageFileName;
        postResume.encrypt = res.encrypt;
        this.getPostImage(postResume);
        this.selectedPost = null;
      }else{
        res.imageFileContent = null;
        this.getPostImage(res);
        this.posts.push(res);
      }
    }
  }

  onClosedViewer(res: any): void {
    this.isViewingPost = false;
    this.getInteractions(this.selectedPost);
  }


  deletePost(event:Event, p:any):void{
    event.stopPropagation();    
    this._api.setApi('Posts');
    let deleteQ = "";
    if(this.translate.currentLang == 'es')
      deleteQ = '¿Esta seguro de que quiere eliminar este post?'
    else 
      deleteQ = 'Are you sure you want to delete this post?'
    if(confirm(deleteQ)){
      this.ngxService.start(); 
      let idx = this.posts.findIndex(e=> e.shareCode == p.shareCode);
      this.posts.splice(idx,1);
      if(p.id && p.id.length == 24)
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
    this.writeOptions.encrypt = false;
    this.userSession.putFile(this.postsFileName,postsArray, this.writeOptions)
    .then(() =>{
      
      
      this.userSession.deleteFile(p.postFileName);
      if(p.imageFileName)
        this.userSession.deleteFile(p.imageFileName);

 

      this.ngxService.stop(); 
    }).catch((error) => {
      console.log('Error deleting post!')
      this.ngxService.stop();
    });

  }

  editPost(p:any):void{
    this.selectedPost = p;
    this.isNewPost = true;
  }

  shareBlog():void {
    
    if(this.translate.currentLang == 'es')
      this.shareTitle = "Compartir este Blog!"
    else 
      this.shareTitle = "Share this Blog!"
    this.selectedPost = null;
    this.postId = null;
  }

  sharePost(event:Event, p:any):void{
   // if(p.status!=0){
      this.selectedPost = p;
      if(this.translate.currentLang == 'es')
        this.shareTitle = "Compartir este Post!"
      else 
        this.shareTitle = "Share this Post!"
      this.postId=p.shareCode?p.shareCode:p.id;
      this.isSharingPost = true;
    // }
    // else{
    //   alert('private post share')
    //   this.readOptions.username = 'dmyblog_.id.blockstack';
    //   this.readOptions.decrypt = false;
    //   this.userSession.getFile(this.globals.publicKeyFileName, this.readOptions)
    //     .then(fileContent =>{
    //       alert(fileContent)
    //     })
    //     .catch((error)=>{
    //       console.log('Error loading public key');
          
    //     });
     

       
    //   event.stopPropagation();    
    // }    
  }

  goToAuthorBlog(event:Event, p){
    event.stopPropagation();    
    this.isSharingPost = true;
    this.router.navigate(['/blog/'+p.author]);
    return true
  }

  
  launchSocial(url:string){
    if(url==null || url == ''){
      let lang = localStorage.getItem('dmyblog.lang');
      if(lang == 'es')
        this.toastr.info("No hay informacón de la red social en el perfil.")
      else 
        this.toastr.info("There is no social network information in the profile.")
    }
    else{
      window.open(url, '_blank');
    }

  }

  getProfileData(){
    let up = new blockstack.lookupProfile(this.userName).then(p=>{
      let avatarObj = p.image? p.image.filter(e=> e.name=='avatar')[0] : null;
      if(avatarObj!= null)
      {
        this.avatarURL = avatarObj.contentUrl;
      }
      else
        this.avatarURL = 'assets/User-blue-icon.png';


      let accounts = p.account;
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
    });
  }
}
