import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostPrivateReadComponent } from './post-private-read.component';

describe('PostPrivateReadComponent', () => {
  let component: PostPrivateReadComponent;
  let fixture: ComponentFixture<PostPrivateReadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PostPrivateReadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostPrivateReadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
