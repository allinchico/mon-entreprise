import React from 'react'
import classNames from 'classnames'
import R from 'ramda'
import {AttachDictionary} from '../AttachDictionary'
import knownMecanisms from 'Engine/known-mecanisms.yaml'
import {makeJsx} from 'Engine/evaluation'
import './Algorithm.css'
import { humanFigure } from "./RuleValueVignette"

let RuleWithoutFormula = () => [
	<p>
		Cette règle n'a pas de formule de calcul pour l'instant (elle n'en aura même
		peut-être jamais !)
	</p>,
	<p>Sa valeur doit donc être renseignée directement.</p>
]


@AttachDictionary(knownMecanisms)
export default class Algorithm extends React.Component {
	state = {
		showValues: true
	}
	render(){
		let {traversedRule: rule, showValues} = this.props,
			ruleWithoutFormula = !rule['formule'] || rule.formule.explanation['une possibilité']
		return (
			<div id="algorithm">
				<section id="rule-rules" className={classNames({showValues})}>
					{ do {
						// TODO ce let est incompréhensible !
						let [,cond] =
							R.toPairs(rule).find(([,v]) => v && v.rulePropType == 'cond') || []
						cond != null &&
							<section id="declenchement">
								<h2>Déclenchement</h2>
								{makeJsx(cond)}
							</section>
					}}
					<section id="formule">
						<h2>
							Calcul
							{!ruleWithoutFormula && <small>Cliquez sur chaque chaque valeur pour comprendre</small> }
						</h2>
						{ruleWithoutFormula
							? <RuleWithoutFormula />
							: makeJsx(rule['formule'])
						}
					</section>
					<section
						id="ruleValue"
						style={{ display: showValues ? "block" : "none" }} >
						<i className="fa fa-calculator" aria-hidden="true"></i>{' '}{rule.nodeValue == 0
							? "Règle non applicable"
							: rule.nodeValue == null
								? "Situation incomplète"
								: humanFigure(2)(rule.nodeValue) + " €"}
					</section>
				</section>
			</div>
		)
	}
}
