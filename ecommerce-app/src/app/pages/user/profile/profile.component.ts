import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { User } from '../../../core/types/User';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  user: User | null =null;
  route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.route.data.subscribe(data=>{
      // const object = {
      //   name: '',
      //   age: 15
      // }
      // object['name'] 
      // object.name
      console.log(data['user']);
      this.user = data['user'];
    })
  }

}
