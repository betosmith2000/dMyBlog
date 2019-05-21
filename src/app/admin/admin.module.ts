import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsComponent } from './settings/settings.component';
import { ShareModule } from '../share/share.module';

@NgModule({
  declarations: [
    SettingsComponent
    ],
  imports: [
    CommonModule,
    ShareModule
  ]
})
export class AdminModule { }
