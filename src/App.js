
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
    const [files, setFiles] = React.useState([]);
    const [uploading, setUploading] = React.useState(false);
    const fileInputRef = React.useRef(null);

    React.useEffect(() => {
        getData();
        getFiles();
    },[])

    React.useEffect(() => {
        if(data) {
            onChange(data);
        }
    },[data])

    const getData = () => { 
        onSnapshot(
            doc(db, "data", "MAINDOC"),
            { includeMetadataChanges: true },
            (docSnap) => {
                const docData = docSnap.data();
                if (docData && docData.data !== undefined && docData.data !== null) {
                    setData(docData.data);
                }
            });
    }

    const getFiles = () => {
        onSnapshot(
            doc(db, "data", "FILES"),
            { includeMetadataChanges: true },
            (docSnap) => {
                const docData = docSnap.data();
                if (docData && docData.files !== undefined && docData.files !== null) {
                    setFiles(docData.files);
                }
            });
    }

    const onChange = async (data) => {
         setDoc(doc(db, "data", "MAINDOC"), {
            data
        });
    }

    const handleFileUpload = async (e) => {
        const selectedFiles = e.target.files;
        if (!selectedFiles || selectedFiles.length === 0) return;

        setUploading(true);
        try {
            const newFiles = [...files];
            for (let i = 0; i < selectedFiles.length; i++) {
                const file = selectedFiles[i];
                const timestamp = Date.now();
                const storagePath = `uploads/${timestamp}_${file.name}`;
                const storageRef = storage.ref(storagePath);
                await storageRef.put(file);
                const downloadURL = await storageRef.getDownloadURL();
                newFiles.push({
                    name: file.name,
                    url: downloadURL,
                    path: storagePath,
                    size: file.size,
                    type: file.type,
                    uploadedAt: timestamp
                });
            }
            await setDoc(doc(db, "data", "FILES"), { files: newFiles });
        } catch (error) {
            console.error("Upload failed:", error);
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleDeleteFile = async (index) => {
        try {
            const fileToDelete = files[index];
            const storageRef = storage.ref(fileToDelete.path);
            await storageRef.delete();
            const updatedFiles = files.filter((_, i) => i !== index);
            await setDoc(doc(db, "data", "FILES"), { files: updatedFiles });
        } catch (error) {
            console.error("Delete failed:", error);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className='container'>
            <textarea value={data} onChange={e => setData(e.target.value)}>
            </textarea>
            <div className="file-section">
                <div className="file-header">
                    <h3>Shared Files</h3>
                    <label className="upload-btn" aria-label="Upload files">
                        {uploading ? 'Uploading...' : '+ Upload File'}
                        <input
                            type="file"
                            multiple
                            onChange={handleFileUpload}
                            disabled={uploading}
                            ref={fileInputRef}
                            data-testid="file-input"
                        />
                    </label>
                </div>
                {files.length === 0 ? (
                    <p className="no-files">No files shared yet.</p>
                ) : (
                    <ul className="file-list">
                        {files.map((file, index) => (
                            <li key={file.uploadedAt + file.name} className="file-item">
                                <div className="file-info">
                                    <a
                                        href={file.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="file-name"
                                    >
                                        {file.name}
                                    </a>
                                    <span className="file-size">{formatFileSize(file.size)}</span>
                                </div>
                                <div className="file-actions">
                                    <a
                                        href={file.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="download-btn"
                                        aria-label={`Download ${file.name}`}
                                    >
                                        Download
                                    </a>
                                    <button
                                        onClick={() => handleDeleteFile(index)}
                                        className="delete-btn"
                                        aria-label={`Delete ${file.name}`}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}
export default App;