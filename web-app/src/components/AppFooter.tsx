import { buttonVariants } from './ui/button'
import { SettingsIcon } from 'lucide-react'
import { useTranslation } from '@/i18n'
import { VERSION_DISPLAY } from '@/lib/version'
import { Link } from 'react-router-dom'

export function AppFooter() {
	const { t } = useTranslation()
	return (
		<div className="w-full h-10 items-center justify-between  bottom-0 flex px-4 bg-background/50 border-t border-border backdrop-blur-md py-4">
			<div className="space-x-2 flex-1 w-full flex items-center relative">
				<span className="text-sm text-muted-foreground ml-1">
					{VERSION_DISPLAY}
				</span>
			</div>
			<div className="flex items-center gap-2">
				<Link
					to="/settings"
					className={buttonVariants({
						size: 'icon-sm',
						variant: 'outline',
					})}
					aria-label={t('settings.title')}
				>
					<SettingsIcon />
				</Link>
			</div>
		</div>
	)
}
