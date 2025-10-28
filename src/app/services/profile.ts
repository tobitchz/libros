import { Injectable } from "@angular/core";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth, updateProfile } from "firebase/auth";

@Injectable({
  providedIn: "root"
})



export class ProfileService {

  async uploadAvatar(file: File): Promise<string> {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if(!user){
         throw new Error("no user logged in");

    }



    const storage = getStorage();
    const avatarRef = ref(storage, `users/${user.uid}/avatar.jpg`);

    await uploadBytes(avatarRef, file);
    const url = await getDownloadURL(avatarRef);

    await updateProfile(user, { photoURL: url });
    return url;
  }
}
