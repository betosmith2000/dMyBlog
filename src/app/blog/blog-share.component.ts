import { Component, OnInit, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Post } from './models/Post';
import { GlobalsService } from '../share/globals.service';
import * as blockstack from '../../../node_modules/blockstack/dist/blockstack.js';
import { TranslateService } from '@ngx-translate/core';
import { Md5 } from 'ts-md5/dist/md5';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ShareModel } from '../share/Models/share.model';
import { ApiService } from '../share/data-service';


@Component({
  selector: 'app-blog-share',
  templateUrl: './blog-share.component.html',
  styleUrls: ['./blog-share.component.scss']
})
export class BlogShareComponent implements OnInit {
  userSession :any;
  readOptions : any = {decrypt: false, username: null};

  blockstackIdToShare : string;
  pkToShare:string ='';

  url:string;
  urlSEO:string;
  shareWidth: string="600";
  shareHeight: string="480";
  title:string;
  selectedTheme:string ='dark';
  isPrivateShare:boolean = false;

  privatePostEncryptedFileName = '';
  writeOptions : any = {encrypt:false};
  showURL:boolean=true;
  
  

  constructor(private toastr: ToastrService, private globals: GlobalsService,
    private ngxService: NgxUiLoaderService, private api: ApiService,
    private translate: TranslateService) { }

  
  private _post: Post = null;
  @Input()
  set Post(post: Post) {
      this._post = post;
      this.Init();
      
  }
  get Post(): Post {
      return this._post;
  }

  private _postUser: string = null;
  @Input()
  set PostUser(postUser: string) {
      this._postUser = postUser;
      this.Init();

  }
  get PostUser(): string {
      return this._postUser;
  }



  ngOnInit() {

    const appConfig = new blockstack.AppConfig(['store_write', 'publish_data'])
    this.userSession = new blockstack.UserSession({appConfig:appConfig});


    this.selectedTheme= this.globals.getCurrentTheme();
    this.globals.getTheme().subscribe(theme=>{
      this.selectedTheme = theme;
    });

  }
  
  Init() {
    this.blockstackIdToShare = "";
    if(this.Post  ){
      if(this.Post.status == 0){
        this.isPrivateShare = true;
        this.privatePostEncryptedFileName = Md5.hashStr(new Date().toISOString(),false).toString() +'.hex';
        this.url=window.location.origin +"/#/private-read/" +this.Post.author +"/" +  this.privatePostEncryptedFileName;
        this.showURL=false;
      }
      else{
        this.isPrivateShare=false;
        this.title = this.Post.title;
        this.urlSEO="https://www.dmyblog.co/read/"+  this.Post.id;
        this.url=window.location.origin +"/#/read/" +this.Post.author +"/" +  this.Post.id;
        this.showURL=true;
      }
    }
    else{
      this.url=window.location.origin+"#/blog/" + this.PostUser;
    }
  }

  

    copyInputMessage(inputElement){
      
      // if(this.PostId==null)
      //   inputElement.value=window.location.origin+"/#/blog/" + this.UserBlog;
      // else
      //   inputElement.value=window.location.origin+"/#/read/" + this.UserBlog + "/" + this.PostId;

      inputElement.select();
      document.execCommand('copy');
      inputElement.setSelectionRange(0, 0);

      this.toastr.success("Copied URL!",'Success')        
      
      
    }

    share(type:string){
      var s = this.getSharer(type)
      s.width = this.shareWidth;
      s.height = this.shareHeight
      return s !== undefined ? this.urlSharer(s) : false;
    }

    
    getSharer(type:string):any{
      var _sharer: any = {};
      if(type == 'facebook'){
          _sharer= this.sharers['facebook']
          _sharer.params.u = this.urlSEO;
      }
      else if(type == 'twitter'){
          _sharer = this.sharers['twitter'];
          _sharer.params.text = this.Post.title;
          _sharer.params.url = this.urlSEO;
      }
      else if(type == 'linkedIn'){
          _sharer = this.sharers['linkedin'];
          _sharer.params.url = this.urlSEO;
      }

      return _sharer;

    }

  private sharers = {
    facebook: {
        shareUrl: 'https://www.facebook.com/sharer/sharer.php',
        params: {
          u: '', 
         // quote:'dMyBlog',
          hashtag:'#dMyBlog'
        }
    },
    linkedin: {
        shareUrl: 'https://www.linkedin.com/shareArticle',
        params: {
            url:'',
            mini: true,
            shareMediaCategory:'ARTICLE'
        }
    },
    twitter: {
        shareUrl: 'https://twitter.com/intent/tweet/',
        params: {
            text: '',
            url: '',
            hashtags: 'dMyBlog',
            via: 'dmyblog_'
        }
    }
  }

  

  private urlSharer(sharer: any) {
    var p = sharer.params || {},
        keys = Object.keys(p),
        i: any,
        str = keys.length > 0 ? '?' : '';
    for (i = 0; i < keys.length; i++) {
        if (str !== '?') {
            str += '&';
        }
        if (p[keys[i]]) {
            str += keys[i] + '=' + encodeURIComponent(p[keys[i]]);
        }
    }

    var url = sharer.shareUrl + str;

    if (!sharer.isLink) {
        var popWidth = sharer.width || 600,
            popHeight = sharer.height || 480,
            left = window.innerWidth / 2 - popWidth / 2 + window.screenX,
            top = window.innerHeight / 2 - popHeight / 2 + window.screenY,
            popParams = 'scrollbars=no, width=' + popWidth + ', height=' + popHeight + ', top=' + top + ', left=' + left,
            newWindow = window.open(url, '', popParams);

        if (window.focus) {
            newWindow.focus();
        }
    } else {
        window.location.href = url;
    }
  }

  seachPKBlockstackId(){
    this.ngxService.start();        
    this.blockstackIdToShare = this.blockstackIdToShare.trim();
    if(!this.blockstackIdToShare || this.blockstackIdToShare ==  ''){
      if(this.translate.currentLang == 'es')
        this.toastr.warning("Debe indicar el Blockstack Id del usuario.", "Lllave Pública desconocida" )
      else 
        this.toastr.warning("You must indicate the Blockstack Id of the user.", "Public Key unknown");
    }

    this.readOptions.username = this.blockstackIdToShare;
    this.readOptions.decrypt = false;
    this.userSession.getFile(this.globals.publicKeyFileName, this.readOptions)
        .then(fileContent =>{
          if(fileContent!=null && fileContent != '')
          {

            this.pkToShare = fileContent;
            this.encryptFileContents();
          }
          else{
            if(this.translate.currentLang == 'es')
              this.toastr.warning("El usuario no tiene visible su llave pública, no es posible compartir el post privado.", "Lllave Pública desconocida" )
            else 
              this.toastr.warning("The user does not have his public key visible, it is not possible to share the private post.", "Public Key unknown");
            this.ngxService.stop();        
            
          }
          
      })
      .catch((error)=>{
        if(this.translate.currentLang == 'es')
          this.toastr.warning("No se encontro la llave pública del usuario indicado.", "Lllave Pública desconocida")
        else 
          this.toastr.warning("The public key of the indicated user was not found.", "Public Key unknown");
      
          this.ngxService.stop();        

        console.log('Error loading public key');
        
      });
     


  }

  encryptFileContents(){
    this.readOptions.decrypt=true;
    this.readOptions.username=this.Post.author;
    this.userSession.getFile(this.Post.postFileName,this.readOptions)
    
    .then((fileContents) => {
      var postComp = JSON.parse(fileContents);
      postComp.author = this.Post.author;
      postComp.date= this.Post.date;
      postComp.imageFileName=this.Post.imageFileName;
    var encryptedBS = this.userSession.encryptContent(JSON.stringify(postComp), { publicKey:this.pkToShare});
    this.userSession.putFile(this.privatePostEncryptedFileName, encryptedBS, this.writeOptions)
       .then(cipherTextUrl => { 
        var share= new ShareModel();
        let hash  = Md5.hashStr(new Date().toISOString(),false);
        share.id =hash.toString();
        share.source = postComp.author;
        share.target = this.blockstackIdToShare;
        share.fileName = this.privatePostEncryptedFileName;
        share.name =postComp.postTitle;
        this.api.setApi("share");
        this.api.add<ShareModel>(share)
        .subscribe(res => {
          if(this.translate.currentLang == 'es')
            this.toastr.success("Se ha creado el archivo encriptado correctamente.", "Lllave Pública desconocida")
          else 
            this.toastr.success("The encrypted file was created successfully.", "Public Key unknown");
      

          console.log('Password sharing success' );
          this.showURL=true
          this.ngxService.stop();        
         }, error =>{
           console.log('Error sharing password');
           this.ngxService.stop();
         });
        })

    }).catch((error)=>{
        this.ngxService.stop();        
    });
   

  

  }


}
