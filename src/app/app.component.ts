import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as msal from '@azure/msal-browser';
import axios from 'axios';

const msalConfig = {
  auth: {
    clientId: 'fa0b4cf5-e807-43d4-93dd-4b8c380df8bf',
    authority: 'https://login.microsoftonline.com/c0e8b31f-ec80-4ea3-9c69-88ba49dd7f9c',
    redirectUri: 'https://gray-plant-099627600.5.azurestaticapps.net'
  }
};

const msalInstance = new msal.PublicClientApplication(msalConfig);

@Component({
  selector: 'app-root',
  template: `
    <div>Hello {{ value }}</div>
    <div> NS Token: {{ nsToken }} </div>
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
  nsToken: string = '';
  errorMessage: string = '';

  constructor(private http: HttpClient) { }

  async ngOnInit() {
    try {
      await msalInstance.initialize();  // Ensure the instance is initialized
      const result = await msalInstance.handleRedirectPromise();
      if (result) {
        this.value = result.account.username;
        const token = result.accessToken;
        const userId = result.account.idTokenClaims.oid;
        const firstGroupName = await this.getUserGroups(token, userId);  // Wait for the promise to resolve

        if (firstGroupName == 'MasterGroup') {
          await this.loginToNS();
        };

      } else {
        msalInstance.loginRedirect();
      }
    } catch (error) {
      console.error('Error during initialization:', error);
    }
  }

  async getUserGroups(token: string, userId: string): Promise<string> {
    const response = await fetch(`https://graph.microsoft.com/v1.0/users/${userId}/memberOf`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    // Filter the groups to find the first one with "@odata.type": "#microsoft.graph.group"
    const group = data.value.find((item: any) => item["@odata.type"] === "#microsoft.graph.group");

    if (group) {
      const groupResponse = await fetch(`https://graph.microsoft.com/v1.0/groups/${group.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const groupData = await groupResponse.json();
      return groupData.displayName; // Return the first group's display name as a string
    } else {
      throw new Error('No groups found or unexpected response structure');
    }
  }

  async loginToNS() {
    const url = 'https://oneclickvouchertest.azurewebsites.net/functions-ext/api/v1/login';
    const body = { username: 'servicesMaster', password: 'DSTe@m!22' };
    const headers = new HttpHeaders({
      'Ocp-Apim-Subscription-Key': 'Y6BvR0SyIvsCPF7R33RR3ffcPSVEf3nRv8XTQWAo2pHyAzFuz4POeQ==',
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    this.http.post(url, body, { headers }).subscribe(
      (response: any) => {
        this.nsToken = response.data.token;
        this.errorMessage = '';
      },
      error => {
        this.errorMessage = `Error: ${error.message}`;
      }
    );
  }
}


