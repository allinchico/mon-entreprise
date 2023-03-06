import { Trans, useTranslation } from 'react-i18next'

import { Condition } from '@/components/EngineValue'
import { useEngine } from '@/components/utils/EngineContext'
import { Grid } from '@/design-system/layout'
import { H2 } from '@/design-system/typography/heading'
import { MergedSimulatorDataValues } from '@/hooks/useCurrentSimulatorData'
import { GuideURSSAFCard } from '@/pages/simulateurs/cards/GuideURSSAFCard'
import { IframeIntegrationCard } from '@/pages/simulateurs/cards/IframeIntegrationCard'
import { SimulatorRessourceCard } from '@/pages/simulateurs/cards/SimulatorRessourceCard'
import { useSitePaths } from '@/sitePaths'

import { FAQAutoEntrepreneurArticle } from '../assistants/choix-du-statut/CreationChecklist'

interface NextStepsProps {
	iframePath?: MergedSimulatorDataValues['iframePath']
	nextSteps: MergedSimulatorDataValues['nextSteps']
}

export function NextSteps({ iframePath, nextSteps }: NextStepsProps) {
	const { absoluteSitePaths } = useSitePaths()
	const { language } = useTranslation().i18n
	const engine = useEngine()

	const guideUrssaf = guidesUrssaf.find(
		({ associatedRule }) => engine.evaluate(associatedRule).nodeValue
	)

	if (!iframePath && !nextSteps && !guideUrssaf) {
		return null
	}

	return (
		<section className="print-hidden">
			<H2>
				<Trans>Ressources utiles</Trans>
			</H2>
			<Grid container spacing={3} role="list">
				<Condition expression="dirigeant . auto-entrepreneur">
					<Grid item xs={12} sm={6} lg={4} role="listitem">
						<FAQAutoEntrepreneurArticle />
					</Grid>
				</Condition>

				{guideUrssaf && language === 'fr' && (
					<Grid item xs={12} sm={6} lg={4} role="listitem">
						<GuideURSSAFCard guideUrssaf={guideUrssaf} />
					</Grid>
				)}

				{nextSteps?.map((simulatorId) => (
					<Grid item xs={12} sm={6} lg={4} key={simulatorId} role="listitem">
						<SimulatorRessourceCard simulatorId={simulatorId} />
					</Grid>
				))}

				{iframePath && (
					<Grid item xs={12} sm={6} lg={4} role="listitem">
						<IframeIntegrationCard
							iframePath={iframePath}
							sitePaths={absoluteSitePaths}
						/>
					</Grid>
				)}
			</Grid>
		</section>
	)
}

const guidesUrssaf = [
	{
		url: 'https://www.urssaf.fr/portail/files/live/sites/urssaf/files/documents/PAM/Diaporama_Medecins.pdf',
		associatedRule: "dirigeant . indépendant . PL . métier = 'santé . médecin'",
		title: 'Guide Urssaf pour les médecins libéraux',
	},
	{
		url: 'https://www.urssaf.fr/portail/files/live/sites/urssaf/files/documents/Diaporama_PL_statuts_hors_AE_et_PAM.pdf',
		associatedRule: 'entreprise . activité . nature . libérale . réglementée',
		title: 'Guide Urssaf pour les professions libérales réglementées',
	},
	{
		url: 'https://www.autoentrepreneur.urssaf.fr/portail/files/Guides/Urssaf-Guide-AutoEntrepreneur-metropole.pdf',
		associatedRule: 'dirigeant . auto-entrepreneur',
		title: 'Guide Urssaf pour les auto-entrepreneurs',
	},
	{
		url: 'https://www.urssaf.fr/portail/files/live/sites/urssaf/files/documents/Diaporama_TI_statuts_hors_AE.pdf',
		associatedRule: 'dirigeant',
		title: 'Guide Urssaf pour les indépendants',
	},
	{
		url: 'https://www.urssaf.fr/portail/home/employeur/employer-du-personnel/nouvel-employeur.html',
		title: "Nouvel employeur : l'Urssaf vous accompagne",
		description:
			'Vous créez votre premier emploi ? Découvrez le service Urssaf Première Embauche, un accompagnement personnalisé et entièrement gratuit pendant un an.',
		associatedRule: {
			'toutes ces conditions': [
				'dirigeant = non',
				{ 'est non défini': 'artiste-auteur' },
			],
		},
		ctaLabel: 'En savoir plus',
	},
]