import { Component, OnInit, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Post } from './models/Post';
import { GlobalsService } from '../share/globals.service';

@Component({
  selector: 'app-blog-share',
  templateUrl: './blog-share.component.html',
  styleUrls: ['./blog-share.component.scss']
})
export class BlogShareComponent implements OnInit {
  url:string;
  urlSEO:string;
  shareWidth: string="600";
  shareHeight: string="480";
  title:string;
  selectedTheme:string ='dark';


  constructor(private toastr: ToastrService, private globals: GlobalsService) { }

  
  private _post: Post = null;
  @Input()
  set Post(post: Post) {
      this._post = post;
      this.Init();

  }
  get Post(): Post {
      return this._post;
  }

  private _postUser: string = null;
  @Input()
  set PostUser(postUser: string) {
      this._postUser = postUser;
      this.Init();

  }
  get PostUser(): string {
      return this._postUser;
  }



  ngOnInit() {
    this.selectedTheme= this.globals.getCurrentTheme();
    this.globals.getTheme().subscribe(theme=>{
      this.selectedTheme = theme;
    });

  }
  
  Init() {
    if(this.Post  ){
      this.title = this.Post.title;
      this.urlSEO="https://www.dmyblog.co/read/"+  this.Post.id;
      this.url=window.location.origin +"/#/read/" +this.Post.author +"/" +  this.Post.id;
    }
    else{
      this.url=window.location.origin+"#/blog/" + this.PostUser;
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

    share(type:string){
      var s = this.getSharer(type)
      s.width = this.shareWidth;
      s.height = this.shareHeight
      return s !== undefined ? this.urlSharer(s) : false;
    }

    
    getSharer(type:string):any{
      var _sharer: any = {};
      if(type == 'facebook'){
          _sharer= this.sharers['facebook']
          _sharer.params.u = this.urlSEO;
      }
      else if(type == 'twitter'){
          _sharer = this.sharers['twitter'];
          _sharer.params.text = this.Post.title;
          _sharer.params.url = this.urlSEO;
      }
      else if(type == 'linkedIn'){
          _sharer = this.sharers['linkedin'];
          _sharer.params.url = this.urlSEO;
      }

      return _sharer;

    }

  private sharers = {
    facebook: {
        shareUrl: 'https://www.facebook.com/sharer/sharer.php',
        params: {
          u: '', 
         // quote:'dMyBlog',
          hashtag:'#dMyBlog'
        }
    },
    linkedin: {
        shareUrl: 'https://www.linkedin.com/shareArticle',
        params: {
            url:'',
            mini: true,
            shareMediaCategory:'ARTICLE'
        }
    },
    twitter: {
        shareUrl: 'https://twitter.com/intent/tweet/',
        params: {
            text: '',
            url: '',
            hashtags: 'dMyBlog',
            via: 'dmyblog_'
        }
    }
  }

  

  private urlSharer(sharer: any) {
    var p = sharer.params || {},
        keys = Object.keys(p),
        i: any,
        str = keys.length > 0 ? '?' : '';
    for (i = 0; i < keys.length; i++) {
        if (str !== '?') {
            str += '&';
        }
        if (p[keys[i]]) {
            str += keys[i] + '=' + encodeURIComponent(p[keys[i]]);
        }
    }

    var url = sharer.shareUrl + str;

    if (!sharer.isLink) {
        var popWidth = sharer.width || 600,
            popHeight = sharer.height || 480,
            left = window.innerWidth / 2 - popWidth / 2 + window.screenX,
            top = window.innerHeight / 2 - popHeight / 2 + window.screenY,
            popParams = 'scrollbars=no, width=' + popWidth + ', height=' + popHeight + ', top=' + top + ', left=' + left,
            newWindow = window.open(url, '', popParams);

        if (window.focus) {
            newWindow.focus();
        }
    } else {
        window.location.href = url;
    }
}


}
