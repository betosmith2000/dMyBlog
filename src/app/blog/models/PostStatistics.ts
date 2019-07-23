export interface IPostStatistics{
    totalUsers:number;
    totalPublicPosts:number;
}

export class PostStatistics implements IPostStatistics{
    totalUsers: number;
    totalPublicPosts: number;
}