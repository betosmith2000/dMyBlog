

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
}