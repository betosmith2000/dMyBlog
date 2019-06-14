import { InteractionTypeResult } from './InteractionTypeResult';


export interface IPost {
    id:string;
    title:string;
    date:string;
    excerpt:string;
    author:string;
    postFileName:string;
    imageFileName:string;
    status:number;
    shareCode:string;
    Interaction:InteractionTypeResult;
}

export class Post implements IPost{
    id: string;
    title: string;
    date: string;
    excerpt: string;
    author: string;
    postFileName: string;
    imageFileName: string;
    status:number;
    shareCode:string;
    Interaction:InteractionTypeResult;

}