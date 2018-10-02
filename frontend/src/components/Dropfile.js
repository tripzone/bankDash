import React, { Component } from 'react';
import Dropzone from 'react-dropzone'
import request from 'request';
import classNames from 'classnames'
import { Button } from 'react-materialize'

import './Dropfile.css';
import classnames from 'classnames';

class Dropfile extends Component {

  constructor(props) {
    super(props);
    this.state = {
      currentFiles: [],
    }
    this.onDrop = this.onDrop.bind(this);
  }

  onDrop(files) {
    if (this.state.fileUploaded) {
      this.setState({ currentFiles: files, fileUploaded: false });
    } else {
      this.setState({ currentFiles: files });
    }
  }

  displayFiles() {
    return this.state.currentFiles.map((f, index) => {

      var fileClass = classNames({
        'file-row': true,
        'file-selected': this.props.backendFiles && this.props.backendFiles.includes(f.name),
      });
      return (
        <div key={f.name} className={fileClass}>
          {f.name} - {f.size} bytes
        </div>
      );
    })
  }

  render() {
    return (
      <div>
        <Button waves='light' className={classnames("dropfile-upload-button", { "disabled": this.state.currentFiles.length == 0 })} onClick={() => this.props.submitFile(this.state.currentFiles)}>Upload Files</Button>
        <div className="dropfile-zone">
          <Dropzone onDrop={this.onDrop.bind(this)}>
            <p className='admin-item'>Drop or Click to add files</p>
          </Dropzone>
        </div>
        <div className='dropfile-list'>
          {this.displayFiles()}
        </div>
        <Button waves='light' className={classnames("dropfile-upload-button", { "disabled": !this.props.backendFiles })} onClick={() => this.props.process()}>Process</Button>

      </div >
    );
  }
}

export default Dropfile;
