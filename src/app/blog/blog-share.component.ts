import { Component, OnInit, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-blog-share',
  templateUrl: './blog-share.component.html',
  styleUrls: ['./blog-share.component.scss']
})
export class BlogShareComponent implements OnInit {
  url:string;
  urlFB:string;
  title:string;

  constructor(private toastr: ToastrService) { }

  
  private _userBlog: any = null;
  @Input()
  set UserBlog(userBlog: any) {
      this._userBlog = userBlog;
      this.Init();

  }
  get UserBlog(): any {
      return this._userBlog;
  }

  private _postId: any = null;
  @Input()
  set PostId(postId: any) {
      this._postId = postId;
      this.Init();
  }
  get PostId(): any {
      return this._postId;
  }

  
  private _post: any = null;
  @Input()
  set Post(post: any) {
      this._post = post;
      this.Init();

  }
  get Post(): any {
      return this._post;
  }



  ngOnInit() {
  }
  
  Init() {
    if(this.Post  ){
      this.title = this.Post.title;
      this.urlFB="https://www.dmyblog.co/#/read/" + this.UserBlog +"/" +  ( this.Post != null ? this.Post.shareCode: '');
    }
    if(this.PostId==null){
      this.url=window.location.origin+"/#/blog/" + this.UserBlog;
    }
    else{
      this.url=window.location.origin+"/#/read/" + this.UserBlog + "/" + this.PostId;
    }
  }

  

    copyInputMessage(inputElement){
      
      // if(this.PostId==null)
      //   inputElement.value=window.location.origin+"/#/blog/" + this.UserBlog;
      // else
      //   inputElement.value=window.location.origin+"/#/read/" + this.UserBlog + "/" + this.PostId;

      inputElement.select();
      document.execCommand('copy');
      inputElement.setSelectionRange(0, 0);

      this.toastr.success("Copied URL!",'Success')        
      
      
    }
}
