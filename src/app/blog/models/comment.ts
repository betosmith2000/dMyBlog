export interface IPostComment{
    id:string;
    postId:string;
    userId:string;
    
    fileName:string;
    date: string;
    content:string;
    comments:Array<PostComment>;
    parentId:string;
    rootId:string;
}

export class PostComment implements IPostComment{
    id: string;   
    postId: string;
    userId: string;
    fileName:string;
    date: string;
    content:string;
    comments:Array<PostComment>;
    parentId:string;
    rootId:string;
    constructor(){}
}