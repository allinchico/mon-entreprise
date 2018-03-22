import React, { Component } from 'react'
import { Trans, translate } from 'react-i18next'
import formValueTypes from 'Components/conversation/formValueTypes'
import { rules, findRuleByName } from 'Engine/rules'
import { propEq, contains, without, curry, append, ifElse } from 'ramda'
import './TargetSelection.css'
import BlueButton from './BlueButton'
import { Field, reduxForm, formValueSelector, change } from 'redux-form'
import { connect } from 'react-redux'
import { RuleValue } from './rule/RuleValueVignette'
import classNames from 'classnames'
import { buildValidationFunction } from './conversation/FormDecorator'
export let salaries = ['salaire total', 'salaire de base', 'salaire net']
export let popularTargetNames = [...salaries, 'aides employeur']

@translate()
@reduxForm({
	form: 'conversation'
})
@connect(
	state => ({
		getTargetValue: dottedName =>
			formValueSelector('conversation')(state, dottedName),
		targets: state.analysis ? state.analysis.targets : [],
		flatRules: state.flatRules
		conversationTargetNames: state.conversationTargetNames
	}),
	dispatch => ({
		setFormValue: (field, name) =>
			dispatch(change('conversation', field, name)),
		setConversationTargets: (targetNames, fromScratch = false) =>
			dispatch({ type: 'SET_CONVERSATION_TARGETS', targetNames, fromScratch })
	})
)
export default class TargetSelection extends Component {
	state = {
		activeInput: null
	}

	render() {
		let { targets, conversationTargetNames } = this.props
		this.firstEstimationComplete = this.state.activeInput && targets.length > 0
		return (
			<div id="targetSelection">
				{!this.firstEstimationComplete && <h1>Entrez un salaire mensuel</h1>}
				<section
					id="targetsContainer"
					style={{
						background: this.props.colours.colour,
						color: this.props.colours.textColour
					}}
				>
					{this.renderOutputList()}
				</section>

				{this.firstEstimationComplete && (
					<div id="action">
						{conversationTargetNames ? (
							!conversationTargetNames.length && (
								<p>Que voulez-vous affiner ?</p>
							)
						) : (
							<>
								<p>Estimation par défaut pour un CDI non cadre ... </p>
								<BlueButton
									onClick={() => {
										this.props.setConversationTargets([])
									}}
								>
									Personnaliser
								</BlueButton>
							</>
						)}
					</div>
				)}
			</div>
		)
	}

	renderOutputList() {
		let popularTargets = popularTargetNames.map(curry(findRuleByName)(flatRules)),
			{
				conversationTargetNames,
				textColourOnWhite,
				setConversationTargets
			} = this.props,
			optionIsChecked = s => (conversationTargetNames || []).includes(s.name),
			visibleCheckbox = s =>
				conversationTargetNames && s.dottedName !== this.state.activeInput,
			toggleTarget = target =>
				ifElse(contains(target), without(target), append(target))

		return (
			<div>
				<div id="targets">
					{popularTargets.map(s => (
						<div key={s.name}>
							<div className="main">
								{visibleCheckbox(s) && (
									<input
										id={s.name}
										type="checkbox"
										checked={optionIsChecked(s)}
										onChange={() =>
											setConversationTargets(
												toggleTarget(s.name)(
													(conversationTargetNames || []).filter(
														t => !this.state.activeInput.includes(t)
													)
												)
											)
										}
									/>
								)}
								<label
									htmlFor={s.name}
									key={s.name}
									style={
										optionIsChecked(s)
											? {
													color: textColourOnWhite
											  }
											: {}
									}
								>
									{
										<span
											style={{
												visibility: visibleCheckbox(s) ? 'visible' : 'hidden'
											}}
										>
											{optionIsChecked(s) ? (
												<i
													className="fa fa-check-square-o fa-2x"
													style={{ color: textColourOnWhite }}
												/>
											) : (
												<i
													className="fa fa-square-o fa-2x"
													style={{ color: '#4b4b66' }}
												/>
											)}
										</span>
									}
									<span className="optionTitle">{s.title || s.name}</span>
								</label>
								<TargetInputOrValue
									{...{
										s,
										targets: this.props.targets,
										firstEstimationComplete: this.firstEstimationComplete,
										activeInput: this.state.activeInput,
										setActiveInput: name =>
											this.setState({ activeInput: name }),
										setFormValue: this.props.setFormValue
									}}
								/>
							</div>
							<p>{s['résumé']}</p>
						</div>
					))}
				</div>
			</div>
		)
	}
}
let validate = buildValidationFunction(formValueTypes['euros'])
let InputComponent = ({ input, meta: { dirty, error } }) => (
	<span>
		{dirty && error && <span className="input-error">{error}</span>}
		<input type="number" {...input} autoFocus />
	</span>
)
let TargetInputOrValue = ({
	s,
	targets,
	firstEstimationComplete,
	activeInput,
	setActiveInput,
	clearFormValue
}) => (
	<span className="targetInputOrValue">
		{activeInput === s.dottedName ? (
			<Field
				name={s.dottedName}
				component={InputComponent}
				type="text"
				validate={validate}
			/>
		) : (
			<TargetValue {...{ targets, s, activeInput, setActiveInput }} />
		)}
		{(firstEstimationComplete || s.question) && <span className="unit">€</span>}
	</span>
)

@connect(
	() => ({}),
	dispatch => ({
		setFormValue: (field, name) => dispatch(change('conversation', field, name))
	})
)
class TargetValue extends Component {
	render() {
		let { targets, s, setFormValue, activeInput, setActiveInput } = this.props,
			rule = targets.find(propEq('dottedName', s.dottedName)),
			value = rule && rule.nodeValue,
			humanValue = value != null && value.toFixed(0)

		return (
			<span
				className={classNames({
					editable: s.question,
					attractClick: s.question && targets.length === 0
				})}
				onClick={() => {
					if (!s.question) return
					if (value != null) {
						setFormValue(s.dottedName, humanValue + '')
						setFormValue(activeInput, '')
					}

					setActiveInput(s.dottedName)
				}}
			>
				<RuleValue value={value} />
			</span>
		)
	}
}
