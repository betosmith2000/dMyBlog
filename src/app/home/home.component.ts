import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor() { }

  public ngOnInit() {
    //this.loadScript('assets/js/agency.js');           
    
  }
  
  public loadScript(url) {
    let s = document.getElementById("easing")
    
    if(s){
      document.getElementsByTagName('head')[0].removeChild(s);
      
    }
    
    let node = document.createElement('script');
    node.src = url;
    node.type = 'text/javascript';
    node.id="easing";
    document.getElementsByTagName('head')[0].appendChild(node);
    
    
  }
  
}
