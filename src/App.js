
import React from 'react';
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/storage'; 
import './App.css';

const firebaseConfig = {
  apiKey: "AIzaSyAmuU27Gw1mIgUfWeI1Jvps7JxqCVo-Mcg",
  authDomain: "clipboard-e53eb.firebaseapp.com",
  projectId: "clipboard-e53eb",
  storageBucket: "clipboard-e53eb.appspot.com",
  messagingSenderId: "264409074474",
  appId: "1:264409074474:web:2130fa9384145c4101ac53"
};


const firebaseApp = firebase.initializeApp(firebaseConfig);
export const db = firebaseApp.firestore();
export const storage = firebase.storage();

const App = () => {
    const [data,setData] = React.useState("");


    React.useEffect(() => {
        getData();
    },[])

    React.useEffect(() => {
        if(data) {
            onChange(data);
        }
    },[data])

    const getData = () => { 
        const unsub = onSnapshot(
            doc(db, "data", "MAINDOC"),
            { includeMetadataChanges: true },
            (doc) => {
                console.log(doc.data())
                setData(doc.data().data)
            });
    }

    const onChange = async (data) => {
         setDoc(doc(db, "data", "MAINDOC"), {
            data
        });
    }
    return (
        <div className='container'>
            <textarea value={data} onChange={e => setData(e.target.value)}>
            </textarea>
        </div>
    )
}
export default App;