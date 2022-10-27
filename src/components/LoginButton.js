import { Container, Row, Col, Button, Spinner } from "react-bootstrap";
import { initializeApp } from "firebase/app";
import { getFirestore, query, getDocs, collection, where, updateDoc, doc, setDoc, addDoc } from "firebase/firestore";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { useEffect, useContext, useState } from "react";
import { UserContext } from "../utils/Contexts";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
  measurementId: process.env.REACT_APP_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();
const auth = getAuth();

const LoginButton = () => {
  const { user, setUser } = useContext(UserContext);
  useEffect(() => {
    const refreshLogin = async () => {
      let localUser = localStorage.getItem("user");
      if (localUser) {
        auth.onAuthStateChanged(async (user) => {
          let localUser = localStorage.getItem("user");
          let idToken = await auth.currentUser.getIdToken(true);
          localUser = JSON.parse(localUser);
          localUser.accessToken = idToken;
          localUser.token = idToken;
          localUser.stsTokenManager.expirationTime = Date.now() + 45 * 60 * 1000;
          localStorage.setItem("user", JSON.stringify(localUser));
          setUser(localUser);
        });
        setUser(localUser);
      } else {
        setUser(false);
      }
    };
    refreshLogin();
  }, []);

  const handleSignIn = async (e) => {
    try {
      const res = await signInWithPopup(auth, provider);
      //const credential = GoogleAuthProvider.credentialFromResult(res);
      const user = { ...res.user };
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);
      const q = query(collection(db, "users"), where("uid", "==", user.uid));
      const docs = await getDocs(q);
      if (docs.docs.length === 0) {
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          loginTimes: [new Date().toISOString()],
        });
      } else {
        let userData = docs.docs[0].data();
        let userDocId = docs.docs[0].id;
        await updateDoc(doc(db, "users", userDocId), { loginTimes: [...userData.loginTimes, new Date().toISOString()] });
      }
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleSignOut = async (e) => {
    await signOut(auth);
    setUser(false);
    localStorage.removeItem("user");
  };

  const loginButtonStates = () => {
    if (user) {
      return (
        <Button size="sm" variant="success" onClick={() => handleSignOut()}>
          Sign Out
        </Button>
      );
    } else {
      return (
        <Button size="sm" variant="outline-primary" onClick={() => handleSignIn()}>
          Login
        </Button>
      );
    }
  };

  return loginButtonStates();
};

export default LoginButton;
