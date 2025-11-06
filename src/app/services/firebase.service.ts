import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private app = initializeApp(environment.firebase);
  public auth = getAuth(this.app);
  public firestore = getFirestore(this.app);
  public storage = getStorage(this.app);

  constructor() {
    console.log('Firebase service initialized');
  }
}