import { Component, OnInit, AfterViewInit, Renderer2 } from '@angular/core';

import * as blockstack from 'node_modules/blockstack/dist/blockstack.js';
import { Router, NavigationEnd } from '@angular/router';
import { GlobalsService } from 'src/app/share/globals.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, AfterViewInit {
  ngAfterViewInit(): void {
    this.themeConfig();
    
  }
  selectedTheme:string ='dark';

  constructor(private route: Router, private globals: GlobalsService, private render: Renderer2) { 
    
    this.scrollToAnchor("topPage",0);
    this.route.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
          const tree = this.route.parseUrl(this.route.url);
          if (tree.fragment) {
            this.scrollToAnchor(tree.fragment,100);
          }
       }
    });
  

  }
  
  onThemeChange(theme:string):void{
    this.selectedTheme = theme;
    localStorage.setItem('dmyblog.theme',theme);
    this.globals.setTheme(theme);
    if(theme == 'dark')
      this.render.setStyle(document.body, 'background-image',"url('assets/bg-dark.png'")
    else
      this.render.setStyle(document.body, 'background-image',"url('assets/bg-light.png'")
  }

  public scrollToAnchor(location: string, wait: number): void {
    const element = document.querySelector('#' + location)
    if (element) {
      setTimeout(() => {
        element.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'nearest'})
      }, wait)
    }
  }


  readonly settingsFileName:string = '/settings.txt';
  readOptions : any = {decrypt: false};

  isSignIn : boolean = false;
  userName :string  = 'User name';
  LOGO = require("../../../assets/logo-header.png");
  userSession :any;

  themeConfig(){
    var theme = this.globals.getCurrentTheme();
    this.onThemeChange( theme);
  }

  ngOnInit() {
    const appConfig = new blockstack.AppConfig(['store_write', 'publish_data'])
    this.userSession = new blockstack.UserSession({appConfig:appConfig});
    if (this.userSession.isSignInPending()) {
      this.userSession.handlePendingSignIn()
      .then(userData => {
        //const profile = userData.profile;
        this.isSignIn = true;
        this.userName = userData.username;
        this.userSession.getFile(this.settingsFileName,this.readOptions)
        .then((fileContents) => {
          let data = JSON.parse(fileContents);

          if(data.blogName== null || data.blogName =='')
            this.route.navigate(['settings/']);
          else
          this.route.navigate(['blog/' +this.userName]);
        })
        .catch((error)=>{
          console.log('Error reading settings');
        });

        
      })
    } else 
    
    if (this.userSession.isUserSignedIn()) {
      const userData = this.userSession.loadUserData();
      this.isSignIn = true;
      this.userName = userData.username;
      //this.route.navigate(['blog/' +this.userName]);
     } 
  }

  signIn():void{
    this.userSession.redirectToSignIn();
    if (this.userSession.isSignInPending()) {
        this.userSession.handlePendingSignIn()
        .then(userData => {
          //const profile = userData.profile;
          this.isSignIn = true;
          this.userName = userData.username;
         // this.route.navigate(['blog/' +this.userName]);
        })
    }
  }

  signOut():void{
    this.userSession.signUserOut(window.location.origin);
  }



}
