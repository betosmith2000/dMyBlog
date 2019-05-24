
export class CustomUploaderAdapter {
    loader;
    reader;
  
    constructor( loader){
        this.loader = loader;
    }
  
    upload(){
        return this.loader.file
            .then( file => new Promise( ( resolve, reject ) => {
                const reader = this.reader=  new FileReader();
                reader.onload = function() {
                    resolve( { default: reader.result } );    
                };
    
                reader.onerror = function( error ) {
                    reject( error );
                };
    
                reader.onabort = function() {
                    reject();
                };
    
                reader.readAsDataURL( file );

            } ) );
    }
  
    abort(){
        debugger;
        if ( this.reader ) {
			this.reader.abort();
		}
    }
  
  }