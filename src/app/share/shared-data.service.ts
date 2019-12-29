import { Injectable } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import * as blockstack from 'node_modules/blockstack/dist/blockstack.js';
import { ShareModel } from './Models/share.model';
import { ApiService } from './data-service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';



@Injectable({
    providedIn: 'root',
  })
  export class SharedDataService {

    
    userSession :any;
    userName :string  = 'User name';
    readOptions : any = {decrypt: false, username: null};
    writeOptions : any = {encrypt:false};

    sharedContents:Array<ShareModel>;
    sharedContentsWithMe:Array<ShareModel>;

    private isSharedContentLoaded: boolean=false;


    constructor(private toastr: ToastrService, private ngxService: NgxUiLoaderService, 
        private api: ApiService, private translate: TranslateService){

        const appConfig = new blockstack.AppConfig(['store_write', 'publish_data'])
        this.userSession = new blockstack.UserSession({appConfig:appConfig});
        if (this.userSession.isSignInPending()) {
            this.userSession.handlePendingSignIn()
            .then(userData => {
              this.userName = userData.userName;
            })
          } 
          else  if (this.userSession.isUserSignedIn()) {
            const userData = this.userSession.loadUserData();
            this.userName = userData.username;
           } 
  
    }


    getSharedContent(){

        if(!this.isSharedContentLoaded){
            this.ngxService.start();        
            this.api.setApi("share");
            this.api.getAll<any>("username=" + this.userName) 
            .subscribe(res => {
                this.isSharedContentLoaded= true;
                var contents = new Array<ShareModel>();
                contents = res.data;
                this.sharedContents =contents.filter(e=> e.source == this.userName);
                this.sharedContentsWithMe =contents.filter(e=> e.target == this.userName);
                this.ngxService.stop();        
                // this.sharedContents.forEach(e=>{
                //   this.loadSharedContent(e);

                // });
            }, error =>{
                console.log('Error getting shared content');
                this.ngxService.stop();
        
            });
        }
    }

    loadSharedContent(p: ShareModel){
      this.readOptions.username = p.source;
      //this.ngxService.start();        

      this.userSession.getFile(p.fileName, this.readOptions )
        .then( fileContent =>{
          if(fileContent!=null){
            var decrypted = this.userSession.decryptContent(fileContent);
            p.content = JSON.parse(decrypted);
          }
          //this.ngxService.stop();        
        })
        .catch((error)=>{
          console.log('Error reading file!');
          //this.ngxService.stop();        
        });

    }

    deletePost(p:ShareModel){
      this.readOptions.username = p.source;
      this.ngxService.start();        

      this.api.delete(p.id)
      .subscribe(res => {
        let idx = this.sharedContents.findIndex(e=> e.id == p.id);
        
        if(idx==-1){
          idx= this.sharedContentsWithMe.findIndex(e=> e.id == p.id);
          this.sharedContentsWithMe.splice(idx,1);

        }
        else{
          this.sharedContents.splice(idx,1);
        }

        

        console.log('Delete private Post id:' + p.id);
        this.ngxService.stop();        
        if(p.source == this.userName)
          this.userSession.deleteFile(p.fileName);

        let deleteQ = "";

        if(this.translate.currentLang == 'es')
          deleteQ = 'El post privado ha sido eliminado.'
        else 
          deleteQ = 'The private post has been deleted.'

          
        this.toastr.success("deleteQ",'Success')

      }, error =>{
        console.log('Error to save post to index');
        
        this.ngxService.stop();        

      });


      
      
    }

  }