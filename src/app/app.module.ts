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
import { BlogShareComponent } from './blog/blog-share.component';
import { DiscoverComponent } from './blog/discover.component';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    HomeComponent,
    BlogComponent,
    PostReaderComponent,
    BlogShareComponent,
    DiscoverComponent
  ],
  imports: [
    BrowserAnimationsModule,
    AppRoutingModule,
    ShareModule,
    AdminModule,
    ToastrModule.forRoot(),
    HttpClientModule

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
