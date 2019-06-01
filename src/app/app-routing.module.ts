import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SettingsComponent } from './admin/settings/settings.component';
import { HomeComponent } from './home/home.component';
import { BlogComponent } from './blog/blog.component';
import { PostReaderComponent } from './blog/post-reader.component';
import { DiscoverComponent } from './blog/discover.component';

const routes: Routes = [
  { path: "settings", component: SettingsComponent},
  { path: "blog/:userBlog", component: BlogComponent},
  { path: "read/:userBlog/:postId", component: PostReaderComponent},
  { path: "discover", component: DiscoverComponent},
  { path: "", component: HomeComponent},
  { path: "*", component: HomeComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes,{
    useHash:true,
    enableTracing:true
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
