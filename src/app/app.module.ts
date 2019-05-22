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

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    HomeComponent,
    BlogComponent,
    PostReaderComponent
  ],
  imports: [
    BrowserAnimationsModule,
    AppRoutingModule,
    ShareModule,
    AdminModule,
    ToastrModule.forRoot(),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
