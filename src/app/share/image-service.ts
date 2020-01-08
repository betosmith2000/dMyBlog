import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ImageService {
    onImageLoaded = new ReplaySubject(1);
    self = this;
    getImage(url:string){
        
     let ras =  fetch(url)
      .then(r =>  r.blob()) 
      .then(createImageBitmap)
      .then(img => {
        console.log(img); 
        return new Promise(res => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          var ctx = canvas.getContext('bitmaprenderer');
          if(ctx ) {
            eval('ctx.transferFromImageBitmap(img)')
          }
          else {
            canvas.getContext('2d').drawImage(img,0,0);
          }
          canvas.toBlob(res);
        });
      })
      .then(blob  => { 
        var reader = new FileReader();
        reader.readAsDataURL(blob as Blob); 
        reader.onloadend = ()=> { 
          var base64data = reader.result;   
          
          //$("#imgAvatar").attr('src', base64data );
          this.onImageLoaded.next(base64data);  
        }

        
    });
      

      
    }
}
