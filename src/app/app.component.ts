import { Component, OnInit } from '@angular/core';
import { GlobalsService } from './share/globals.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'dMyBlog';
  public selectedTheme:string;

  constructor(private globals:GlobalsService){}

  ngOnInit(): void {
    this.globals.getTheme().subscribe(theme=>{
      this.selectedTheme = theme;
    });
  }
  
}
