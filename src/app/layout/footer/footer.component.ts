import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { GlobalsService } from 'src/app/share/globals.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  public version : string = environment.VERSION;
  public selectedTheme:string;

  constructor( private globals: GlobalsService) { 
   
  }

  ngOnInit() {
     this.globals.getTheme().subscribe(theme=>{
      this.selectedTheme = theme;
    });
  }

}
