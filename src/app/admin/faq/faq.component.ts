import { Component, OnInit } from '@angular/core';
import { GlobalsService } from 'src/app/share/globals.service';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent implements OnInit {
  selectedTheme:string ='dark';

  constructor(private globals: GlobalsService) { }

  ngOnInit() {
    this.selectedTheme= this.globals.getCurrentTheme();
    this.globals.getTheme().subscribe(theme=>{
      this.selectedTheme = theme;
    });

  }

}
