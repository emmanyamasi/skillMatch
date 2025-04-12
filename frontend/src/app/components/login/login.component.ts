// src/app/components/login/login.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  user = { email: '', password: '' };
  isSubmitting = false; // Add this to prevent multiple submissions

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    if (this.isSubmitting) {
      console.log('Already submitting, ignoring');
      return;
    }

    console.log('onSubmit called');
    console.log('Login payload:', this.user);

    this.isSubmitting = true;
    this.authService.login(this.user).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        
        if (response.access_token) {
          localStorage.setItem('access_token', response.access_token.accessToken);
          localStorage.setItem('refresh_token', response.access_token.refreshToken);
          localStorage.setItem('user_id', response.user.id.toString());
          localStorage.setItem('role_id', response.user.role_id.toString());

          switch (response.user.role_id) {
            case 1:
              this.router.navigate(['/admin']);
              break;
            case 2:
              this.router.navigate(['/employer']);
              break;
            case 3:
              this.router.navigate(['/jobseeker']);
              break;
            default:
              this.router.navigate(['/']);
          }
        } else {
          console.error('No access token received.');
        }
      },
      error: (error) => {
        console.error('Login failed:', error);
        console.log('Status:', error.status);
        console.log('Message:', error.message);
        console.log('Error details:', error.error);
        alert('Login failed. Please try again.');
        this.isSubmitting = false;
      },
      complete: () => {
        console.log('Login request completed');
        this.isSubmitting = false;
      },
    });
  }
}