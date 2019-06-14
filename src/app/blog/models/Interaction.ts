export interface IInteraction{
    id:string;
    postId:string;
    userId:string;
    type:number;
}

export class Interaction implements IInteraction{
    id: string;   
    postId: string;
    userId: string;
    
    constructor(public type:number){}
}