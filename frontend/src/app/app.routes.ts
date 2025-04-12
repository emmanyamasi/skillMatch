import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';
import { JobseekerProfileComponent } from './components/jobseeker-profile/jobseeker-profile.component';

export const routes: Routes = [


    { path: '', component: HomeComponent },

    { path: 'register', component: RegisterComponent },

    { path: 'login', component: LoginComponent },
    { path: 'jobseeker', component: JobseekerProfileComponent },
];
