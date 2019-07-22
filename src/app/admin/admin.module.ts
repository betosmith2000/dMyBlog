import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsComponent } from './settings/settings.component';
import { ShareModule } from '../share/share.module';
import { FaqComponent } from './faq/faq.component';

@NgModule({
  declarations: [
    SettingsComponent,
    FaqComponent
    ],
  imports: [
    CommonModule,
    ShareModule
  ]
})
export class AdminModule { }
