import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import * as blockstack from 'node_modules/blockstack/dist/blockstack.js';
import { Md5 } from 'ts-md5/dist/md5';
import { CustomUploaderAdapter } from './CKEditor/customUploaderAdapter';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ApiService } from '../share/data-service';
import { NameValue } from '../share/name-value';
import { Post } from './models/Post';
import * as introJs from 'intro.js/intro.js';
import * as ClassicEditor from './CKEditor/ckeditor.js';
import { GlobalsService } from '../share/globals.service';
import { attachedFile } from '../share/attached-file';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationService, ResolveEmit } from "@jaspero/ng-confirmations";

declare var $: any;


@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss']
})
export class PostComponent implements OnInit {
  introJS = introJs();
  isShowingTour :boolean=false;
  
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
  postExcerpt:FormControl;
  postContent:FormControl;
  status:FormControl;
  attachedFiles: Array<attachedFile> = new Array<attachedFile>();
  editingPost:any;
  catStatus: NameValue[];
  selectedTheme:string ='dark';

  public Editor = ClassicEditor;
  ckconfig = {
    //placeholder: 'Type the content here!',
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

  constructor(private toastr:ToastrService, private ngxService: NgxUiLoaderService, 
    private _api:ApiService, private globals: GlobalsService,
    private translate: TranslateService, private _confirmation: ConfirmationService){
  
  }

  setENTtutorial(){
    this.introJS.setOptions({
      steps: [
        {
          intro: "Welcome to <strong>New Post</strong> section, let's take a tour!"+
          "<br /><br />You can leave this tour at any time by clicking on the Skip button or outside this message box, you can also start it by clicking on the '?' Button."
        },
        {
          element: '#step1',
          intro: "This is the title of your post, remember to be attractive!",
          disableInteraction:true
        },
        
        {
          element: '#step2',
          intro: "This is the header image, recommended size 350x350 pixels.",
          disableInteraction:true
        },
        {
          element: "#step3",
          intro: "<p>Here is the status of your post, select according to your needs: <br/>" +
          "<strong>Private</strong>: The post is saved encrypted, nobody but you can access it!<br/>"+
          "<strong>Public</strong>: You can see it and the people that have the link of your post and it can be shared on twitter and facebook.<br/>",
          //"<strong>Browseable</strong>: Like the Public status, it is also listed in the Browse menu.<br/>",
          position:"top",
          disableInteraction:true
        },
        {
          element: '#step4',
          intro: "Here is where you should write the content of your post, use the editing tools: <strong>Paragraph, Bold, Italic, links, bulleted list, numbered list, images, tables and media</strong>.",
          disableInteraction:true
        },
        {
          element: "#step5",
          intro: "You can attach some files here!",
          disableInteraction:true

        },
        {
          element: "#step6",
          intro: "Finally you can save or cancel the post changes!",
          disableInteraction:true

        },
      ]
    });
  }
  
  setESTtutorial(){
    this.introJS.setOptions({
      steps: [
        {
          intro: "Bienvenido a la sección <strong> Nuevo post </strong>, hagamos un recorrido!"+
          "<br /><br />Puede abandonar este recorrido en cualquier momento haciendo clic en el botón Omitir o fuera de este cuadro de mensaje, también puede iniciarlo haciendo clic en el botón '?'."
        },
        {
          element: '#step1',
          intro: "Este es el título de su post, ¡recuerde que debe ser atractivo!",
          disableInteraction:true
        },
        {
          element: '#step2',
          intro: "Esta es la imagen del encabezado,el tamaño recomendado 350x350 píxeles.",
          disableInteraction:true
        },
        {
          element: "#step3",
          intro: "<p>Aquí está el estado de su post, seleccione según sus necesidades: <br/>" +
          "<strong>Private</strong>: El post se guarda encriptado, ¡nadie más que usted puede acceder!<br/>"+
          "<strong>Public</strong>: Puede verlo y las personas que tienen el enlace de su publicación y se puede compartir en Twitter, LinkedIn y Facebook.<br/>",          
          position:"top",
          disableInteraction:true
        },
        {
          element: '#step4',
          intro: "Aquí es donde debe escribir el contenido de su post, use las herramientas de edición: <strong> Párrafo, Negrita, Cursiva, enlaces, lista con viñetas, lista numerada, imágenes, tablas y medios </strong>.",
          disableInteraction:true
        },
        {
          element: "#step5",
          intro: "Puedes adjuntar algunos archivos aquí!",
          disableInteraction:true

        },
        {
          element: "#step6",
          intro: "Finalmente puedes guardar o cancelar los cambios de publicación!",
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
    if(this.translate.currentLang == 'es')
      this.setESTtutorial();
    else 
      this.setENTtutorial()
   
 
    this.introJS.start();
    this.introJS.onexit(x =>{
    
      this.isShowingTour=false;
      localStorage.setItem('dmyblog.globalHelp',"1");

    });
  }




  ngOnInit() {
    this.selectedTheme= this.globals.getCurrentTheme();
    this.globals.getTheme().subscribe(theme=>{
      this.selectedTheme = theme;
    });

    let scrollToTop = window.setInterval(() => {
      let pos = window.pageYOffset;
      if (pos > 0) {
          window.scrollTo(0, pos - 20); // how far to scroll on each step
      } else {
          window.clearInterval(scrollToTop);
      }
    }, 16);

    this.hasImageHeader=false;
    this.catStatus = [
      new NameValue(0, 'Private'),
      //new NameValue(1, 'Public'),
      new NameValue(2, 'Public')
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

     
        this.writeOptions.encrypt=this.Post.encrypt;
        this.readOptions.decrypt=this.Post.encrypt;
     
      this.userSession.getFile(this.Post.postFileName,this.readOptions)
        .then((fileContents) => {
          this.editingPost = JSON.parse(fileContents);
          this.postTitle.setValue(this.editingPost.postTitle);
          this.postExcerpt.setValue(this.editingPost.postExcerpt);
          this.postContent.setValue(this.editingPost.postContent);
          
          if( this.editingPost.attachedFiles)
            this.attachedFiles = this.editingPost.attachedFiles;

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
    this.postExcerpt = new FormControl('', [Validators.maxLength(256), Validators.required]);
    this.postContent = new FormControl('', [Validators.required]);
    this.status = new FormControl('', [Validators.required]);

    this.form = new FormGroup({
      postTitle : this.postTitle,
      postContent : this.postContent,
      postExcerpt: this.postExcerpt, 
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
          this.startTour(false);

      })
      .catch((error)=>{
        console.log('Error loading post collection');
      });

  }

  save():void{
    if(this.form.invalid)
    {
      if(this.translate.currentLang == 'es')
        this.toastr.warning("Los campos marcados con * son requeridos");
      else
        this.toastr.warning("Fields marked with * are required");
      return;
    }
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
        excerpt:this.postExcerpt.value,
        author: this.userName,
        postFileName: this.postContentFileName.replace('ID',hash.toString()) ,
        imageFileName:this.postImageFileName.replace('ID',hash.toString()) ,
        status: this.status.value,
        shareCode: hash.toString(),
        interactions:null,
        encrypt:this.status.value == "0",
        attachedFiles : this.attachedFiles
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
        postResume.excerpt=this.postExcerpt.value;
        postResume.title = this.postTitle.value;
        postResume.status =  this.status.value;
        postResume.encrypt =  this.status.value == "0";
        postResume.attachedFiles = this.attachedFiles;
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
    p.attachedFiles = postData.attachedFiles;

    let postsArray = JSON.stringify(this.posts);
    let postContent = JSON.stringify(p);
    this.writeOptions.encrypt=false;
    this.userSession.putFile(this.postsFileName,postsArray, this.writeOptions)
    .then(() =>{
      
      this.writeOptions.encrypt=postData.encrypt;
      
      postContent = postContent.replace(/img src/g,"img style=\\\"max-width:100%\\\" src");
      postContent = postContent.replace(/a href/g,"a target='_blank' href");

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

  handleAttachedFile(e){
    var file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];

   // var pattern = /image-*/;
    var reader = new FileReader();

    // if (!file.type.match(pattern)) {
    //   this.toastr.error("Uploaded file is not a valid image. Only image files are allowed!",'Error');
    //   return;
    // }
    

    reader.onload = this._handleAttachedFileLoaded.bind(this, file.name);
    reader.readAsDataURL(file);
  }

  
  _handleAttachedFileLoaded(fileName, e) {
    var reader = e.target;
    let hash  = Md5.hashStr(new Date().toISOString(),false);
    var newFile = new attachedFile();
    newFile.name = fileName;
    newFile.id = hash.toString();
    this.ngxService.start();
    var wo = this.writeOptions;
    wo.encrypt = false;
    this.userSession.putFile(newFile.id,reader.result, wo)
      .then(() =>{
        this.ngxService.stop();
        this.attachedFiles.push(newFile);
      })
      .catch((error)=>{
        console.log('Error saving file');
        this.ngxService.stop();
      });
  }

  deleteAttachedFile(f){
    this._confirmation.create('Are you sure you want to delete file?')
    .subscribe((ans: ResolveEmit) => {
        if (ans.resolved) {
          let idx = this.attachedFiles.findIndex(e=> e.id == f.id);
          this.attachedFiles.splice(idx,1);
      }
    });
    setTimeout(() => {
        $(".jaspero__confirmation_dialog").css("position","fixed")    
    }, 10);
  }
  downloadAttachedFile(f){
    this.userSession.getFile(f.id,this.readOptions)
        .then((fileContents) => {
          var element = document.createElement('a');
          element.setAttribute('href', fileContents);
          element.setAttribute('download', f.name);
          element.style.display = 'none';
          document.body.appendChild(element);
          element.click();
          document.body.removeChild(element);
        })
        .catch((error)=>{
          console.log('Error loading post collection');
          this.ngxService.stop();
        });
  }

  removeImageHeader():void{
    if(this.Post!= null && this.Post.imageFileName){
      this.Post.imageFileName=null;
      this.postImageContent = null;
     
    }
    this.postImageContent=null;
    this.hasImageHeader = false;

  }

}


