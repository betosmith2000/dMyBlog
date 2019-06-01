export interface INameValue {
    value: any;
    name: string;
    
}

export class NameValue implements INameValue {
    
    constructor(public value: any, public name: string) {

    }

}