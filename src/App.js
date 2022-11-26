import './App.css';
import React , {useState} from 'react';
import { uploadFile} from 'react-s3';
// import { deleteFile } from 'react-s3';
// import { S3Client } from "@aws-sdk/client-s3";
// import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import AWS from 'aws-sdk';
import Swal from 'sweetalert2';

AWS.config.update({
  accessKeyId: process.env.REACT_APP_accessKeyId,
  secretAccessKey: process.env.REACT_APP_secretAccessKey,
  region: process.env.REACT_APP_REGION
});

var s3 = new AWS.S3();

window.Buffer = window.Buffer || require('buffer').Buffer;


// const bucketParams = { Bucket: "inputbuk", Key: "hindi.txt" };

// const REGION = "us-east-1";

// const s3Client = new S3Client({ region: REGION });

function App() {

  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  })

  const config = {
    bucketName: process.env.REACT_APP_BUCKET_NAME,
    region: process.env.REACT_APP_REGION,
    accessKeyId: process.env.REACT_APP_accessKeyId,
    secretAccessKey: process.env.REACT_APP_secretAccessKey,
    s3Url: process.env.REACT_APP_s3Url,
}

  console.log(config);

  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState("");
  console.log(fileName);

  const handleFileInput = (e) => {
      setSelectedFile(e.target.files[0]);
      console.log(e.target.files[0].name);
      setFileName(e.target.files[0].name);
  }

  const handleUpload = async (file) => {
    uploadFile(file, config)
        .then(data => {
          console.log(data);
          if(data.result.status===204){
            Toast.fire({
              icon: 'success',
              title: 'File uploaded successfully'
            })
            document.getElementById("loader").style.display = "block";
          }
          else{
            Toast.fire({
              icon: 'error',
              title: 'File upload failed'
            })
          }
        })
        .catch(err => {
          Toast.fire({
            icon: 'error',
            title: `${err}`
          });
          console.error(err);
        })
}

const handleFetch = async () => {
  await fetch(`https://outputbuk.s3.amazonaws.com/${fileName}`).then ((response) => response.text())
  .then (data => {
    console.log(data);
    let link = `https://outputbuk.s3.amazonaws.com/${fileName}`;
    document.getElementById("link").style.display = "block";
    document.getElementById("link").setAttribute("href", link);
    document.getElementById("output").innerText = data;
    document.getElementById("loader").style.display = "none";
  }).catch(err => {
    Toast.fire({
      icon: 'error',
      title: `${err}`
    });
    console.error(err);
  })
}

  var params = {  Bucket: 'inputbuk', Key: fileName };
  var params1 = {  Bucket: 'outputbuk', Key: fileName };

const handleDelete = () => {
  
 s3.deleteObject(params, function (err) {
    if (err){
      Toast.fire({
        icon: 'error',
        title: `${err}`
      });
      console.error(err); 
    }// error
    else
      // deleted
      Toast.fire({
        icon: 'success',
        title: 'Deleted Succefully object 1'
      })
  });


 s3.deleteObject(params1, function(err) {
    if (err){ 
      Toast.fire({
        icon: 'error',
        title: `${err}`
      });
      console.error(err); 
     } // error
    else     
    Toast.fire({
      icon: 'success',
      title: 'Deleted Succefully object 2'
    })              // deleted
  });

    // await s3Client.send(new DeleteObjectCommand(bucketParams)).then(data => console.log(data)).catch(err => console.error(err));
}

  return (
    <div className="App">
      <div><h2>React S3 File Upload</h2></div>
        <input type="file" onChange={handleFileInput} className="files" required={true}/>
        <br></br>
        <button onClick={() => handleUpload(selectedFile)} className="upload"> Upload to S3</button>
        <br></br>
        <button onClick={() => handleFetch()} className="fetch"> Fetch from S3</button>
        <br></br>
        <button onClick={() => handleDelete()} className="delete"> Delete from S3</button>
        <br></br>
        <p id='output'>
        </p>
        <a href="/" id="link" download>Download File</a>
        <div className="loader" id="loader"></div>
    </div>
  );
}

export default App;
