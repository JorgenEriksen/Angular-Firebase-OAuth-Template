import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { auth } from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import * as firebase from "firebase";

import { Observable, of } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { Bruker } from '../models/Bruker';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  bruker$: Observable<Bruker>;

  constructor(private afAuth: AngularFireAuth, private afs: AngularFirestore, private router: Router) {
    this.bruker$ = this.afAuth.authState.pipe(
      switchMap(bruker => {
        if (bruker) {
          return this.afs.doc<Bruker>(`brukere/${bruker.uid}`).valueChanges();
        } else {
          return of(null);
        }
      }));
   }

   async googleLoggInn(){
     const provider = new auth.GoogleAuthProvider();
     const credential = await this.afAuth.signInWithPopup(provider);
     return this.oppdaterBrukerData(credential.user);
   }

   async loggUt(){
     await this.afAuth.signOut();
     return this.router.navigate(['/']);
   }

   private oppdaterBrukerData(bruker){
     const brukerRef: AngularFirestoreDocument<Bruker> = this.afs.doc(`brukere/${bruker.uid}`);

     const data = {
       uid: bruker.uid,
       email: bruker.email,
       visningsnavn: bruker.displayName
     };

     return brukerRef.set(data, { merge: true });
   }
}
