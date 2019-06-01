import { Component, OnInit } from '@angular/core';
import { Post } from './Post';
import { ApiService } from '../share/data-service';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.component.html',
  styleUrls: ['./discover.component.scss']
})
export class DiscoverComponent implements OnInit {

  posts:any=new Array();
  constructor(private _api:ApiService) { 
    _api.setApi('Posts')
  }

  ngOnInit() {
    this._api.getAll<Post[]>("").subscribe(d => {
      this.posts = d;
  });
  }

}
