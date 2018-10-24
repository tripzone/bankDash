import React, { Component } from 'react';
import { serverPath } from './variables'
import CategoryList from './components/CategoryList'
import './Edit.css';

class GetData extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loaded: false,
      categories: false
    }
  }

  componentDidMount() {
    let source = ""
    if (this.props.source == 'subcategories') {
      source = 'subCategories';
    } else if (this.props.source == 'maps') {
      source = 'maps'
    }

    fetch(serverPath + "/getMappings", {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        "source": source,
      },
    }).then(x => x.json()).then(response => {
      console.log(response)
      this.setState({ categories: response.data, loaded: true })
    })
  }

  render() {
    return this.state.loaded ?
      <div>
        {this.state.categories.map((x, index) => <CategoryList name={x.item} subcategory={x.subCategory} breakdown={this.props.breakdown} index={index} />)}
      </div> : 'Loading...';
  }
};

class Edit extends Component {

  render() {
    return (
      <div className="Edit">
        <nav className="nav-extended">
          <div className="nav-content">
            <ul className="tabs tabs-transparent">
              <li className="tab"><a href="#test1">Categories</a></li>
              <li className="tab"><a href="#test2">1 to 1 Maps</a></li>
              <li className="tab"><a href="#test4">Data</a></li>
            </ul>
          </div>
        </nav>
        <div id="test1" className="col s12"><GetData source="subcategories" breakdown={this.props.breakdown} /></div>
        <div id="test2" className="col s12"><GetData source="maps" breakdown={this.props.breakdown} /></div>
        <div id="test4" className="col s12">Test 4</div>
      </div>
    );
  }
}

export default Edit;
