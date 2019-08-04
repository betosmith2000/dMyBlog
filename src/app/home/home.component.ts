import { Component, OnInit } from '@angular/core';
import { ApiService } from '../share/data-service';
import { IPostStatistics, PostStatistics } from '../blog/models/PostStatistics';
import { GlobalsService } from '../share/globals.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  statistics:IPostStatistics;
  public selectedTheme:string='';

  constructor(private _api:ApiService, private globals:GlobalsService ) { 
    this._api.setApi("Statistics");
   
  }

  public ngOnInit() {
    this.selectedTheme= this.globals.getCurrentTheme();
    this.globals.getTheme().subscribe(theme=>{
      this.selectedTheme = theme;
    });

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
