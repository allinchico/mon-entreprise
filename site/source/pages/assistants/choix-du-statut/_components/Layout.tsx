import { Message } from '@/design-system'
import { Grid } from '@/design-system/layout'
import { H1 } from '@/design-system/typography/heading'

import StatutsDisponibles from './StatutsDisponibles'

export default function Layout({
	title,
	children,
}: {
	title: string
	children: React.ReactNode
}) {
	return (
		<>
			<H1>{title}</H1>
			<Grid container spacing={5}>
				<Grid item sm={12} md={8} lg={9}>
					{children}
				</Grid>
				<Grid item sm={12} md={4} lg={3}>
					<Message>
						<StatutsDisponibles />
					</Message>
				</Grid>
			</Grid>
		</>
	)
}