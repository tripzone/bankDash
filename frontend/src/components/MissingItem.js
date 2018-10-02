import React, { Component } from 'react';
import Dropzone from 'react-dropzone'
import request from 'request';
import classNames from 'classnames'
import { Input, Icon } from 'react-materialize'

import './MissingItem.css';


class MissingItem extends Component {

	constructor(props) {
		super(props);
		this.state = {
			category: null,
			showOneonOne: null,
			showCategories: null,
			categoryText: null,
		}
	}

	componentDidMount() {
		this.setState({
			showOneonOne: null,
			showCategories: null,
		})
	}

	addOneonOne() {
		this.setState({
			showOneonOne: true,
			showCategories: false,
		})
	}

	addCategory() {
		this.setState({
			showOneonOne: false,
			showCategories: true,
		})
	}

	setCategory(value) {
		this.setState({
			category: value
		})
		this.props.categoriesSubmit(this.props.item.hash, this.state.categoryText, value)
	}

	setCategoryText(value) {
		this.setState({
			categoryText: value,
		})
		this.props.categoriesSubmit(this.props.item.hash, value, this.state.category)
	}

	render() {
		return (
			<div className="missingitem-row">
				<span className="missingitem-cell">{this.props.item.date}</span>
				<span className="missingitem-cell largecell">{this.props.item.item}</span>
				<span className="missingitem-cell">{this.props.item.balance}</span>
				<span className="missingitem-cell">{this.props.item.account}</span>
				<span className="missingitem-cell">
					<a className="hover-clickable" onClick={() => this.addOneonOne()}><Icon small>filter_1</Icon></a>
					<a className="hover-clickable" onClick={() => this.addCategory()}><Icon small>filter</Icon></a>
				</span>

				{this.state.showOneonOne &&
					<span>
						<Input s={12} type='select' defaultValue='' onChange={(e, value) => this.props.oneToOneSubmit(this.props.item.item, value)}>
							<option value=""></option>
							{this.props.breakdown.subCategories.map(x =>
								<option value={x}>{x}</option>
							)}
						</Input>
					</span>
				}


				{this.state.showCategories &&
					<div className="input-fields">
						<span className="medcell ">
							<Input className="marginLeft" placeholder="substring" s={6} onChange={(e, value) => this.setCategoryText(value)} />
						</span>
						<span className="medcell marginleft">
							<Input s={6} type='select' defaultValue='' onChange={(e, value) => this.setCategory(value)}>
								<option value=""></option>
								{this.props.breakdown.subCategories.map(x =>
									<option value={x}>{x}</option>
								)}
							</Input>
						</span>


					</div>
				}


			</div>
		);
	}
}

export default MissingItem;
