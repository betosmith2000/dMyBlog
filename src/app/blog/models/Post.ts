import { InteractionTypeResult } from './InteractionTypeResult';
import { attachedFile } from 'src/app/share/attached-file';


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
    interactions:InteractionTypeResult;
    encrypt:boolean;
    attachedFiles: attachedFile[];
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
    interactions:InteractionTypeResult;
    encrypt:boolean;
    attachedFiles: attachedFile[];
}