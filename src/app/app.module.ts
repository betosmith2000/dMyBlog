import { NgModule } from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';
import { AdminModule } from './admin/admin.module';
import { HomeComponent } from './home/home.component';
import { BlogComponent } from './blog/blog.component';
import { ToastrModule} from 'ngx-toastr';
import { ShareModule } from './share/share.module';
import { PostReaderComponent } from './blog/post-reader.component';
import { DiscoverComponent } from './blog/discover.component';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { SafeHtmlPipe } from './Pipes/safe-html';
import { PostInteractionComponent } from './blog/post-interaction.component';
import { PostCommentComponent } from './blog/post-comment.component';
import { CommentReaderComponent } from './blog/comment-reader.component';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';


export function HttpLoaderFactory(http: HttpClient){
  return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    HomeComponent,
    BlogComponent,
    PostReaderComponent,
    DiscoverComponent,
    SafeHtmlPipe,
    PostInteractionComponent,
    PostCommentComponent,
    CommentReaderComponent,
  ],
  imports: [
    BrowserAnimationsModule,
    AppRoutingModule,
    ShareModule,
    AdminModule,
    ToastrModule.forRoot(),
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
      }
  })
    
    ],
  providers: [],
  bootstrap: [AppComponent]
  
})
export class AppModule { }
