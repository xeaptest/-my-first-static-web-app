import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as msal from '@azure/msal-browser';
import axios from 'axios';

const msalConfig = {
  auth: {
    clientId: 'YOUR_CLIENT_ID',
    authority: 'https://login.microsoftonline.com/c0e8b31f-ec80-4ea3-9c69-88ba49dd7f9c',
    redirectUri: 'https://gray-plant-099627600.5.azurestaticapps.net/.auth/login/aad/callback'
  }
};

const msalInstance = new msal.PublicClientApplication(msalConfig);



@Component({
  selector: 'app-root',
  template: `
    <div>Hello {{ value }}</div>
    <div>
      <label for="username">Username:</label>
      <input id="username" [(ngModel)]="username" />
    </div>
    <div>
      <label for="password">Password:</label>
      <input id="password" [(ngModel)]="password" type="password" />
    </div>
    <button [disabled]="!username || !password" (click)="logIn()">Login</button>
    <div *ngIf="errorMessage" class="error">{{ errorMessage }}</div>
  `,
  styles: [`
    .error {
      color: red;
      margin-top: 20px;
    }
  `]
})
export class AppComponent {
  value: string = '';
  errorMessage: string = '';
  username: string = '';
  password: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.getUserDetails();
  }

  async getUserDetails() {
    try {
      const account = msalInstance.getAllAccounts()[0];
      if (account) {
        this.value = account.username;
        const accessToken = await msalInstance.acquireTokenSilent({
          scopes: ['User.Read']
        });
        this.getUserRoles(accessToken.accessToken);
      } else {
        msalInstance.loginRedirect();
      }
    } catch (error) {
      console.error('Error during authentication:', error);
    }
  }

  async getUserRoles(accessToken: string) {
    try {
      const response = await axios.get('https://graph.microsoft.com/v1.0/me/memberOf', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      console.log('User roles:', response.data.value.map((role: any) => role.displayName));
    } catch (error) {
      console.error('Error fetching user roles:', error);
    }
  }

  logIn() {
    const url = 'https://oneclickvouchertest.azurewebsites.net/functions-ext/api/v1/login';
    const body = { username: this.username, password: this.password };
    const headers = new HttpHeaders({
      'Ocp-Apim-Subscription-Key': 'Y6BvR0SyIvsCPF7R33RR3ffcPSVEf3nRv8XTQWAo2pHyAzFuz4POeQ==',
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    this.http.post(url, body, {headers}).subscribe(
      (response: any) => {
        this.value = response.data.token;
        this.errorMessage = '';
      },
      error => {
        this.errorMessage = `Error: ${error.message}`;
      }
    );
  }
}


