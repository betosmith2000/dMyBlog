import { Component, OnInit, Input } from '@angular/core';
import { ApiService } from '../share/data-service';
import { IInteractionTypeResult, InteractionTypeResult } from './models/InteractionTypeResult';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Post } from './models/Post';
import * as blockstack from 'node_modules/blockstack/dist/blockstack.js';
import { ToastrService } from 'ngx-toastr';
import { Interaction } from './models/Interaction';

@Component({
  selector: 'app-post-interaction',
  templateUrl: './post-interaction.component.html',
  styleUrls: ['./post-interaction.component.scss']
})
export class PostInteractionComponent implements OnInit {
  isInteractionsReady : boolean=false;
  interactions : IInteractionTypeResult = new InteractionTypeResult();
  userSession :any;
  canInteract:boolean=false;
  userName :string  = '';

  private _post: Post = null;
  @Input()
  set Post(post: Post) {
      this._post = post;
  }
  get Post(): Post {
      return this._post;
  }
  
  constructor(private _api:ApiService, private ngxService: NgxUiLoaderService,private toastr:ToastrService) { 
    this._api.setApi("interactions");
  }

  ngOnInit() {
    const appConfig = new blockstack.AppConfig(['store_write', 'publish_data'])
    this.userSession = new blockstack.UserSession({appConfig:appConfig});
    
    if(this.userSession.isUserSignedIn())
    {
      const userData = this.userSession.loadUserData();
      this.userName = userData.username;
      this.canInteract = true;

    }
    else{
      this.canInteract = false;
    }
    
    this.getInteractions();
  }

  getInteractions():void{
    this.ngxService.start();
    
    if(this._post){
      this._api.setApi("interactions");

      let p = "postId=" + this.Post.id + "&userId=" + this.userName;
      this._api.getAll<InteractionTypeResult>(p).subscribe(d => {
        this.isInteractionsReady=true;
        this.interactions = d;
        this.ngxService.stop();
      }, err => {
        this.ngxService.stop();
        console.log('Error loading interactions');
      });
      
    }
  }

  unlike():void{
    if(!this.canInteract){
      this.toastr.warning("You need to login to interact with dMy Blog!",'Warning');      
    }
    else if(this.interactions.isUserLike){
      let interaction = new Interaction(0);
      interaction.id=this.interactions.userInteractionId;
      interaction.postId = this.Post.id;
      interaction.userId = this.userName;
      this.ngxService.start();
      this._api.setApi("interactions");

      this._api.update(interaction.id, interaction)
      .subscribe(res => {
        this.interactions.isUserUnlike = true;
        this.interactions.unlikeCount++;
        this.interactions.isUserLike = false;
        this.interactions.likeCount--;
        this.ngxService.stop();
        console.log('Update interaction id:' + interaction.id);
      }, error =>{
        console.log('Error to update interacion');
        this.ngxService.stop();

      });
    }
    else if(this.interactions.isUserUnlike){ 
      this.ngxService.start();
      this._api.setApi("interactions");
      this._api.delete(this.interactions.userInteractionId)
        .subscribe(res => {
          this.interactions.userInteractionId = "";
          this.interactions.isUserUnlike = false;
          this.interactions.unlikeCount--;

          this.ngxService.stop();
          console.log('Delete user unlike');
        }, error =>{
          console.log('Error to delete unlike');
          this.ngxService.stop();
        });
    }
    else{
      let interaction = new Interaction(0);
      this.sendIntertaction(interaction);
      
    }
  }

  like(event:Event):void{
    event.stopPropagation();    

    if(!this.canInteract){
      this.toastr.warning("You need to login to interact with dMy Blog!",'Warning');
    }
    else if(this.interactions.isUserUnlike){
      let interaction = new Interaction(1);
      interaction.id=this.interactions.userInteractionId;
      interaction.postId = this.Post.id;
      interaction.userId = this.userName;
      this.ngxService.start();
      this._api.setApi("interactions");
      this._api.update(interaction.id, interaction)
      .subscribe(res => {
        this.interactions.isUserUnlike = false;
        this.interactions.unlikeCount--;
        this.interactions.isUserLike = true;
        this.interactions.likeCount++;
        this.ngxService.stop();
        console.log('Update interaction id:' + interaction.id);

      }, error =>{
        console.log('Error to update interacion');
        this.ngxService.stop();

      });
    }
    else if(this.interactions.isUserLike){ 
      this.ngxService.start();
      this._api.setApi("interactions");
      this._api.delete(this.interactions.userInteractionId)
        .subscribe(res => {
          this.interactions.userInteractionId = "";
          this.interactions.isUserLike = false;
          this.interactions.likeCount--;

          this.ngxService.stop();
          console.log('Delete user like');
        }, error =>{
          console.log('Error to delete like');
          this.ngxService.stop();
        });
    }
    else{
      let interaction = new Interaction(1);
      this.sendIntertaction(interaction);
    }
  }

  sendIntertaction(interaction : Interaction):void{
    interaction.postId = this._post.id;
    interaction.userId = this.userName;
    this.ngxService.start();
    this._api.setApi("interactions");
    this._api.add(interaction)
      .subscribe(res => {
        interaction.id= res.id;
        this.interactions.userInteractionId = interaction.id;
        if(interaction.type == 1){
          this.interactions.likeCount++;
          this.interactions.isUserLike = true;
        }
        else if(interaction.type == 0){
          this.interactions.unlikeCount++;
          this.interactions.isUserUnlike = true;
        }
        console.log('Interaction id:' + interaction.id);
        this.ngxService.stop();

      }, error =>{
        console.log('Error to send interaction');
        this.ngxService.stop();

      });
  }

}
