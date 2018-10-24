import React, { Component } from 'react';
import logo from './logo.svg';
import Upload from './Upload';
import Edit from './Edit'
import { serverPath } from './variables'
import './App.css';

const Router = (props) => {
  const { url, breakdown } = props;
  if (/upload/.test(url)) {
    return <Upload breakdown={breakdown} />;
  } else if (/edit/.test(url)) {
    return <Edit breakdown={breakdown} />;
  }
  return <Upload breakdown={breakdown} />;
};

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      breakdown: null,
      loaded: false,
    }
  }

  componentDidMount() {
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
        breakdown,
        loaded: true,
      })
    });
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
        </header>
        {this.state.loaded ? <Router url={window.location.href} breakdown={this.state.breakdown} /> : "Loading..."}
      </div>
    );
  }
}

export default App;
