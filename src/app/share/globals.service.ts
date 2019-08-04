import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GlobalsService {
  private theme = new Subject<string>();
    getTheme() :  Observable<string> {
        return this.theme.asObservable();
    }

    setTheme(theme:string) {
        this.theme.next(theme);
    }

    getCurrentTheme():string{
      var theme = localStorage.getItem('dmyblog.theme');
      if(theme == null)
        theme = 'light';
      return theme;
    }
}
