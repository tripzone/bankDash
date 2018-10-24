import React, { Component } from 'react';
import Dropzone from 'react-dropzone'
import request from 'request';
import classnames from 'classnames';
import { Input, Icon, Button } from 'react-materialize'

import './CategoryList.css';


class CategoryList extends Component {

	constructor(props) {
		super(props);
		this.state = {
			editEnabled: null,
		}
	}

	editToggle() {
		this.setState({
			editEnabled: !this.state.editEnabled,
		})
	}

	submitItemChange() {
		console.log('submitted')
	}

	render() {
		return (
			<div>
				<div className="categorylist-row">
					<span className="categorylist-cell">{this.props.index}</span>
					<span className="categorylist-cell largecell">{this.props.name}</span>
					<span className="categorylist-cell">{this.props.subcategory}</span>
					{!this.state.editEnabled && <span className="categorylist-cell">
						<a className="hover-clickable" onClick={() => this.editToggle()}><Icon small>edit</Icon></a>
					</span>}
					{this.state.editEnabled &&
						<div className="input-fields">
							<Input s={12} type='select' defaultValue='' onChange={(e, value) => this.recordItemChange(value)}>
								<option value=""></option>
								{this.props.breakdown.subCategories.map(x =>
									<option value={x}>{x}</option>
								)}
							</Input>
							<span className="marginleft">
								<a className="hover-clickable" onClick={() => this.submitItemChange()}><Icon small>check_circle</Icon></a>
								<a className="hover-clickable" onClick={() => this.editToggle()}><Icon small>cancel</Icon></a>
							</span>
						</div>

					}
				</div>

			</div>
		);
	}
}

export default CategoryList;
