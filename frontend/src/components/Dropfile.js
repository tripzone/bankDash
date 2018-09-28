import React, { Component } from 'react';
import Dropzone from 'react-dropzone'
import request from 'request';

import './Dropfile.css';

class Dropfile extends Component {

  constructor(props) {
    super(props);

    this.state = {
      currentFiles: [],
      isUploading: false,
    }

    this.submitFile = this.submitFile.bind(this);
    this.onDrop = this.onDrop.bind(this);
  }


  onDrop(files) {
    if (this.state.fileUploaded) {
      this.setState({ currentFiles: files, fileUploaded: false });
    } else {
      this.setState({ currentFiles: files });
    }
  }

  submitFile(e) {
    let length = this.state.currentFiles.length;

    if (length !== 0 && !this.state.isUploading) {
      this.setState({ isUploading: true });
    }
    console.log(this.state.currentFiles)

    this.state.currentFiles.forEach(file => {
      var formData = new FormData();
      formData.append('file', file);
      fetch('http://0.0.0.0:600/file', {
        method: 'POST',
        body: formData
      });
    })


    // fetch('http://0.0.0.0:600/file', { // Your POST endpoint
    //   method: 'POST',
    //   body: this.state.currentFiles // This is your file object
    // }).then(
    //   response => response.json() // if the response is a JSON object
    // ).then(
    //   success => console.log(success) // Handle the success response object
    // ).catch(
    //   error => console.log(error) // Handle the error response object
    // );


    for (let i = 0; i < length; i++) {

      let file = this.state.currentFiles[i];
    }
    // this.setState({ currentFiles: [] });

  }


  process() {
    fetch('http://0.0.0.0:600/process', {
      method: 'POST',
    });
  }

  displayFiles() {
    return this.state.currentFiles.map((f, index) => {
      return (
        <div key={f.name}>
          {f.name} - {f.size} bytes
        </div>
      );
    })
  }

  render() {
    return (
      <div>
        <button className="waves-effect green waves-light btn dropfile-upload-button" onClick={this.submitFile}>Upload Files</button>
        <div className="dropfile-zone">
          <Dropzone onDrop={this.onDrop.bind(this)}>
            <p className='admin-item'>Drop or Click to add files</p>
          </Dropzone>
        </div>
        <div className='dropfile-list'>
          {this.displayFiles()}
        </div>
        <button className="waves-effect green waves-light btn dropfile-upload-button" onClick={this.process}>Process</button>

      </div>
    );
  }
}

export default Dropfile;
