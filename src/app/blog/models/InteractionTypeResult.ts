
export interface IInteractionTypeResult {
    userInteractionId:string;
    isUserLike:boolean;
    isUserUnlike:boolean;
    likeCount:number;
    unlikeCount:number;
    
}

export class InteractionTypeResult implements IInteractionTypeResult{
    userInteractionId:string;
    isUserLike: boolean;
    isUserUnlike: boolean;
    likeCount: number;
    unlikeCount:number;

    
}