import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';
import { JobseekerProfileComponent } from './components/jobseeker-profile/jobseeker-profile.component';
import { JobseekerDashboardComponent } from './components/jobseeker-dashboard/jobseeker-dashboard.component';
import { EmployerDashboardComponent } from './components/employer-dashboard/employer-dashboard.component';

export const routes: Routes = [


    { path: '', component: HomeComponent },

    { path: 'register', component: RegisterComponent },

    { path: 'login', component: LoginComponent },
    { path: 'jobseeker', component: JobseekerProfileComponent },
    { path: 'employer', component: EmployerDashboardComponent },

    { path: 'jobseeker-dashboard', component:JobseekerDashboardComponent },

];
