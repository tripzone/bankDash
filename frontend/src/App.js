import React, { Component } from 'react';
import logo from './logo.svg';
import Dropfile from './components/Dropfile'
import MissingItem from './components/MissingItem'

import './App.css';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      backendFiles: null,
      processedData: null,
      missing: null,
      breakdown: null,
    }

    this.submitFile = this.submitFile.bind(this);
    this.process = this.process.bind(this);
    this.oneToOneSubmit = this.oneToOneSubmit.bind(this);


  }

  componentDidMount() {
    // fetch('http://0.0.0.0:600/reset', {
    //   method: 'POST',
    // });
    fetch('http://0.0.0.0:600/getCategories', {
      method: 'GET',
    }).then(x => x.json()).then(response => {
      const categories = response.data.reduce((sum, x) => {
        return !sum.includes(x.category) ? sum.concat(x.category) : sum;
      }, [])
      const subCategories = response.data.map((x) => {
        return x.subCategory
      })
      const mapping = response.data.reduce((sum, x) => {
        const dummy = {}
        dummy[x.subCategory] = x.category;
        return { ...sum, ...dummy }
      }, {})
      const breakdown = { categories, subCategories, mapping }
      this.setState({
        breakdown
      })
    }
    );
  }

  submitFile(currentFiles) {
    let length = currentFiles.length;
    currentFiles.forEach(file => {
      var formData = new FormData();
      formData.append('file', file);
      fetch('http://0.0.0.0:600/file', {
        method: 'POST',
        body: formData
      }).then(response => response.json())
        .then(response => this.setState({ backendFiles: response.data }))
    })

    for (let i = 0; i < length; i++) {
      let file = currentFiles[i];
    }
  }


  process() {
    fetch('http://0.0.0.0:600/process', {
      method: 'POST',
    }).then(response => response.json())
      .then(response => this.setState({
        processFinished: true,
        processedData: response.data,
        missing: response.missing,
      }));
  }

  oneToOneSubmit(x, value) {
    console.log('hola', x, value)
  }

  categoriesSubmit(x, value) {
    console.log('hey', x, value)
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
        </header>

        {!this.state.processFinished &&
          <Dropfile submitFile={this.submitFile} process={this.process} backendFiles={this.state.backendFiles} />
        }
        {this.state.processFinished && this.state.missing &&
          this.state.processedData.map(item => <MissingItem item={item} breakdown={this.state.breakdown} oneToOneSubmit={this.oneToOneSubmit} categoriesSubmit={this.categoriesSubmit} />)
        }

      </div>
    );
  }
}

export default App;
