import { Component, OnInit } from '@angular/core';
import { ApiService } from '../share/data-service';
import { IPostStatistics, PostStatistics } from '../blog/models/PostStatistics';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  statistics:IPostStatistics;
  constructor(private _api:ApiService) { 
    this._api.setApi("Statistics");
  }

  public ngOnInit() {
    //this.loadScript('assets/js/agency.js');           
    this.getData();
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
  

  
  getData(){
    this._api.setApi("Statistics");

    let p = "";
    this._api.getAll<PostStatistics>(p).subscribe(d => {
      this.statistics = d;
    }, err => {
      
      console.log('Error loading statistics');
    });
    
  }

}
