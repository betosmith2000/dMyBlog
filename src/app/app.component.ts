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

  onActivate(event) {
    let scrollToTop = window.setInterval(() => {
        let pos = window.pageYOffset;
        if (pos > 0) {
            window.scrollTo(0, pos - 20); // how far to scroll on each step
        } else {
            window.clearInterval(scrollToTop);
        }
    }, 16);
}
  
}
