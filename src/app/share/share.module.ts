import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { PostComponent } from '../blog/post.component';
import { NgxUiLoaderModule, NgxUiLoaderConfig, POSITION } from 'ngx-ui-loader';
import { BlogShareComponent } from '../blog/blog-share.component';
import { ContactUsComponent } from '../layout/contact-us/contact-us.component';



@NgModule({

    declarations: [PostComponent,BlogShareComponent,     ContactUsComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    BrowserModule,
    CKEditorModule,
    NgxUiLoaderModule
  ],
  exports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    BrowserModule,
    CKEditorModule, 
    PostComponent,
    NgxUiLoaderModule,BlogShareComponent,    ContactUsComponent
  ]
})
export class ShareModule { }
