import React, { Component } from 'react';
import Dropzone from 'react-dropzone'
import request from 'request';
import classnames from 'classnames';
import { Input, Icon, Button } from 'react-materialize'

import './ItemList.css';


class ItemList extends Component {

	constructor(props) {
		super(props);
		this.state = {
			editEnabled: null,
			selectedSubcategory: null,
			subCategoryChanged: null,
		}
	}

	editToggle() {
		this.setState({
			editEnabled: !this.state.editEnabled,
		})
	}

	recordItemChange(value) {
		if (value) {
			this.setState({
				selectedSubcategory: value
			})
		}
	}

	submitItemChange() {
		if (this.state.selectedSubcategory) {
			this.props.setCustomField(this.props.item.hash, this.state.selectedSubcategory)
				.then(response => {
					this.setState({ subCategoryChanged: true })
					this.editToggle()
				})
		};
	}

	render() {
		return (
			<div>
				<div className="itemlist-row">
					<span className="itemlist-cell">{this.props.item.date}</span>
					<span className="itemlist-cell largecell">{this.props.item.item}</span>
					<span className={classnames("itemlist-cell midcell", { "strikethrough": this.state.subCategoryChanged })}>{this.props.item.subCategory}</span>
					<span className="itemlist-cell">{this.props.item.balance}</span>
					<span className="itemlist-cell">{this.props.item.category}</span>
					<span className="itemlist-cell">{this.props.item.account}</span>
					{!this.state.editEnabled && <span className="itemlist-cell">
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

export default ItemList;
