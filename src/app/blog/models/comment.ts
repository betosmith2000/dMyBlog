export interface IPostComment{
    id:string;
    postId:string;
    userId:string;
    parentPostId:string;
    fileName:string;
    date: string;

}

export class PostComment implements IPostComment{
    id: string;   
    postId: string;
    userId: string;
    parentPostId:string;
    fileName:string;
    date: string;

    constructor(){}
}