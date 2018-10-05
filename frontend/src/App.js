import React, { Component } from 'react';
import logo from './logo.svg';
import Dropfile from './components/Dropfile'
import ItemList from './components/ItemList'
import MissingItem from './components/MissingItem'
import { Button, Icon } from 'react-materialize'
import { serverPath } from './variables'
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      processFinished: null,
      backendFiles: null,
      processedData: null,
      missing: null,
      breakdown: null,
      newOneOnOnes: {},
      newCategories: {},
    }

    this.submitFile = this.submitFile.bind(this);
    this.process = this.process.bind(this);
    this.oneToOneSubmit = this.oneToOneSubmit.bind(this);
    this.categoriesSubmit = this.categoriesSubmit.bind(this);


  }

  componentDidMount() {

    fetch(serverPath + '/reset', {
      method: 'POST',
    });
    fetch(serverPath + '/getCategories', {
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
    // let length = currentFiles.length;

    currentFiles.forEach(file => {
      var formData = new FormData();
      formData.append('file', file);
      fetch(serverPath + '/file', {
        method: 'POST',
        body: formData
      }).then(response => response.json())
        .then(response => this.setState({ backendFiles: response.data }))
    })

    // for (let i = 0; i < length; i++) {
    //   let file = currentFiles[i];
    // }
  }


  process() {
    return fetch(serverPath + '/process', {
      method: 'POST',
    }).then(response => response.json())
      .then(response => this.setState({
        processFinished: true,
        processedData: response.data,
        missing: response.missing,
      }));
  }

  oneToOneSubmit(text, category) {
    let dummy = this.state.newOneOnOnes
    dummy[text] = category;
    this.setState({
      newOneOnOnes: dummy
    })
  }

  categoriesSubmit(hash, text, category) {
    let dummy = this.state.newCategories
    dummy[hash] = { item: text, subCategory: category };
    this.setState({
      newCategories: dummy
    })
  }

  promiseCall1() {
    let goodToSubmit = false;
    let dummyOneonOne = []
    Object.keys(this.state.newOneOnOnes).forEach(x => {
      if (x && this.state.newOneOnOnes[x]) {
        goodToSubmit = true;
        dummyOneonOne.push({ item: x, subCategory: this.state.newOneOnOnes[x] })
      }
    })
    if (goodToSubmit) {
      return fetch(serverPath + '/saveFile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "file": "maps"
        },
        body: JSON.stringify(dummyOneonOne)
      }).then(response => response.json())
        .then(response => console.log('response'))
    }
  }

  promiseCall2() {
    let goodToSubmit = false;
    let dummyCategories = []
    Object.keys(this.state.newCategories).forEach(x => {
      if (this.state.newCategories[x]['item'] && this.state.newCategories[x]['subCategory']) {
        goodToSubmit = true;
        dummyCategories.push(this.state.newCategories[x])
      }
    })
    if (goodToSubmit) {
      return fetch(serverPath + '/saveFile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "file": "subCategories"
        },
        body: JSON.stringify(dummyCategories)
      }).then(response => response.json())
        .then(response => console.log('response'))
    }
  }

  saveMissingDate() {
    const promise1 = this.promiseCall1()
    const promise2 = this.promiseCall2()
    Promise.all([promise1, promise2]).then(() => {
      this.setState({
        newOneOnOnes: {},
        newCategories: {},
      })
      return this.process()
    })
  }

  setCustomField(hash, value) {
    const requestBody = { hash: hash, value: value }
    return fetch(serverPath + '/setCustomField', {
      method: 'POST',
      body: JSON.stringify(requestBody)
    }).then(response => response.json())
      .then(response => response)

  }

  reprocess() {
    return fetch(serverPath + '/reprocess', {
      method: 'POST',
    }).then(response => response.json())
      .then(response => this.resetAll())
  }

  resetAll() {
    this.setState({
      backendFiles: null,
      processFinished: null,
      processedData: null,
      missing: null,
      newOneOnOnes: {},
      newCategories: {},
    })
    fetch(serverPath + '/reset', {
      method: 'POST',
    });
  }


  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          hello boyy
        </header>

        {!this.state.processFinished &&
          <Dropfile submitFile={this.submitFile} process={this.process} backendFiles={this.state.backendFiles} />
        }
        {this.state.processFinished && this.state.missing && (
          <div>
            <h4>Missing</h4>
            {this.state.processedData.map(item => <MissingItem item={item} breakdown={this.state.breakdown} oneToOneSubmit={this.oneToOneSubmit} categoriesSubmit={this.categoriesSubmit} />)}
            <Button waves='light' onClick={() => this.saveMissingDate()}>Save<Icon right>save</Icon></Button>
          </div>
        )
        }

        {this.state.processFinished && !this.state.missing && (
          <div>
            {this.state.processedData.length > 0 && (
              <div>
                <h4>Found & Saved</h4>
                {this.state.processedData.map(item => <ItemList item={item} breakdown={this.state.breakdown} setCustomField={this.setCustomField} />)}
                <Button waves='light' onClick={() => this.resetAll()}> Done </Button>
                <Button waves='light' className='marginleft' onClick={() => this.reprocess()}> Re-Process </Button>
              </div>
            )}
            {this.state.processedData.length == 0 &&
              <div>
                <h4> No new items were found or added</h4>
                <Button waves='light' onClick={() => this.resetAll()}> Done </Button>
              </div>
            }
          </div>
        )
        }

      </div>
    );
  }
}

export default App;
