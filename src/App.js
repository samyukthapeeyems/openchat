import React, { useState } from 'react';
import './App.css';
import { getFirestore, collection, query, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { initializeApp } from 'firebase/app';


const app = initializeApp({
  apiKey: "AIzaSyCiwf02pvKtIDcgdlC1mu60cpG9mtnRv0U",
  authDomain: "open-chat-5526e.firebaseapp.com",
  projectId: "open-chat-5526e",
  storageBucket: "open-chat-5526e.appspot.com",
  messagingSenderId: "1012268667415",
  appId: "1:1012268667415:web:108ed26028810711e44252",
  measurementId: "G-DBCLDN3RM9"
})

const provider = new GoogleAuthProvider();
const auth = getAuth(app);

const db = getFirestore(app);



function App() {

  const [user] = useAuthState(auth);
  return (
    <div className="App">
      <header>
        <section>
          {user ? <ChatRoom /> : <SignIn />}
        </section>
      </header>
    </div>
  );
}



function SignIn() {
  const signInWithGoogle = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;

        // The signed-in user info.
        const user = result.user;
      })
      .catch((error) => {
        console.log(error);
      })
  }

  return (
    <button onClick={signInWithGoogle} className='sign-in-out'>Sign in with Google</button>
  )
}


function SignOut() {
  return auth.currentUser && (
    <button onClick={() => auth.signOut()} className='sign-in-out'>Sign Out</button>
  )
}



function ChatRoom() {
  const messageRef = collection(db, "messages");

  const q = query(messageRef, orderBy('createdAt', 'desc'), limit(25));

  const [messages] = useCollectionData(q, { idField: 'id' });
  const [formValue, setFormValue] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();
    const { uid, photoURL } = auth.currentUser;

    await addDoc(collection(db, 'messages'), {
      text: formValue,
      createdAt: serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('');
  }

  return (
    <div className='main'>
      <div className='button-header'>
        <span>OPEN CHAT</span>
        <SignOut />
      </div>
      <div className='main'>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
      </div>

      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} />
        <button type='submit'> Send </button>
      </form>
    </div>
  )
}



function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (
    <div>
      <div className={`message ${messageClass}`}>
        <img src={photoURL} defaultValue="./profile.png" />
        <p>{text}</p>
      </div>
    </div>

  )
}



export default App;
