import axios from "axios";
import FormData from "form-data";
import React, { useState, useEffect } from 'react';
import moment from "moment";
import "./Uploader.css";

const Uploader = () => {
    const [files, setfiles] = useState([]);
    const [file, setfile] = useState(null);
    const [name, setname] = useState("");
    const [edit, setedit] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        getFiles();
    }, []);

    const getFiles = async () => {
        try {
            const response = await axios.get("http://127.0.0.1:8000/api/upload-file/")
            setfiles(response.data);
        } catch (error) {
            console.log(error);
        }
    }

    const toNifi = async (file) => {
        // NIFI
        try {
            await axios.post("http://localhost:8843/contentListener", file, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
        } catch (error) {
            console.log("NIFI ERROR",error);
        }
    }

    const uploadFiles = async (data) => {

        try {
            await axios.post("http://127.0.0.1:8000/api/upload-file/", data).then((response) => {
                console.log(response);
            });
            getFiles();
        } catch (error) {
            console.log(error);
        }
    }

    const downloadFile = async (file) => {
        try {
            const response = await axios.get(`http://127.0.0.1:8000/api/download-file/${file.id}/`, {
                responseType: 'blob'
            });
            console.log(response.data)
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', file.file); 
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
    
        } catch (error) {
            console.log(error);
        }
    }

    const updateFiles = async (file, updatedFile, updatedName) => {
        try {
            const formData = new FormData();
            formData.append('file', updatedFile);
            formData.append('name', updatedName);
    
            await axios.put(`http://127.0.0.1:8000/api/download-file/${file.id}/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            getFiles();
        } catch (error) {
            console.log(error);
        }
    }
    

    const eraseFiles = async (file) => {
        try {
            await axios.delete(`http://127.0.0.1:8000/api/download-file/${file.id}/`);
            getFiles();
        } catch (error) {
            console.log(error)
        }
    }

    const handleNameChange = (event) => setname(event.target.value);
    const handleFileChange = (event) => {
        setfile(event.target.files[0]);
        setname(event.target.files[0].name);
    }

    const handleUpload = (event) => {
        event.preventDefault();
        const formData = new FormData();
        const fileData = new FormData();
        fileData.append('file', file);
        formData.append('file', file);
        formData.append('name', name);

        if (edit) {
            updateFiles(selectedFile, file, name);
        } else {
            uploadFiles(formData);
            toNifi(fileData);
        }

        setfile(null);
        setname("");
        setedit(false);
        setSelectedFile(null);
    };

    const handleEdit = (file) => {
        setSelectedFile(file);
        setname(file.name);
        setedit(true);
    };

    return (
        <div class="content">
            <div class="title">
                <div class="banner">
                <h1>Vault</h1>
                <img src="/favicon.ico"alt="logo"></img>
                </div>
                <h2>Keep your files <strong>safe</strong>...</h2>
            </div>
            <div class="screen">
            <div class="file-form">
                <form onSubmit={handleUpload}>
                    <ul>
                    <li>
                        <input type="file" required onChange={handleFileChange}></input>
                    </li>
                    <li><input type="text" placeholder="Filename" value={name} required onChange={handleNameChange}></input></li>
                    <li><button type="submit" id={edit? "edit" : ""}>{edit? "Actualizar!" : "Upload!"}</button></li>
                    </ul>
                </form>
            </div>
            
                <table cellspacing="0">
                    <thead>
                        <tr>
                            <th>Filename</th>
                            <th>File</th>
                            <th>Upload Date</th>
                            <th>Options</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            Array.isArray(files) && files.map((file) => (
                                <tr key={file.id}>
                                    <td>{file.name}</td>
                                    <td>{file.file}</td>
                                    <td>{moment(file.uploaded_on).format('Do MMMM YYYY, h:mm:ss a')}</td>
                                    <td>
                                        <button id="delete" onClick={() => eraseFiles(file)}>Delete</button>
                                        <button id="download" onClick={() => downloadFile(file)}>Download</button>
                                        <button id="edit" onClick={() => handleEdit(file)}>Edit</button>
                                    </td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            
            </div>
        </div>
    );
}
 
export default Uploader;