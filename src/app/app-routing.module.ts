import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SettingsComponent } from './admin/settings/settings.component';
import { HomeComponent } from './home/home.component';
import { BlogComponent } from './blog/blog.component';
import { PostReaderComponent } from './blog/post-reader.component';
import { DiscoverComponent } from './blog/discover.component';
import { dMyblogGoHome } from './share/dMyblogGoHome';
import { FaqComponent } from './admin/faq/faq.component';
import { PostPrivateReadComponent } from './blog/post-private-read/post-private-read.component';

const routes: Routes = [
  { path: "settings", component: SettingsComponent},
  { path: "faq", component:FaqComponent},
  { path: "blog/:userBlog", component: BlogComponent},
  { path: "read/:userBlog/:postId", component: PostReaderComponent},
  { path: "private-read/:userBlog/:postId", component: PostPrivateReadComponent},
  { path: "browse", component: DiscoverComponent},
  { path: "home", component: HomeComponent, canActivate:[ dMyblogGoHome]},
  { path: "", component: HomeComponent, canActivate:[ dMyblogGoHome]},
  { path: "*", component: HomeComponent, canActivate:[ dMyblogGoHome]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes,{
    useHash:true,
    enableTracing:true
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
