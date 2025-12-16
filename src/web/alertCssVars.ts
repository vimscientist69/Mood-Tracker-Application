// web/alertCssVars.ts
import { BORDER_RADIUS, SPACING, FONT_SIZES } from '../theme/styleConstants';

export default function injectAlertCssVars() {
    const root = document.documentElement;

    const vars: Record<string, string> = {
        // Colors
        '--rn-alert-bg': '#2d2d2d',
        '--rn-alert-fg': '#ffffff',
        '--rn-alert-muted': 'rgba(255, 255, 255, 0.7)',
        '--rn-alert-surface': '#272727',
        '--rn-alert-border': '#393939',
        '--rn-alert-elev': '0px 8px 24px rgba(0, 0, 0, 0.5)',

        // Buttons
        '--rn-alert-accent': '#bb86fc',
        '--rn-alert-accent-hover': '#c89eff',
        '--rn-alert-danger': '#CF6679',
        '--rn-alert-danger-hover': '#d78290',

        // Spacing & Radius
        '--rn-alert-radius': `${BORDER_RADIUS.card}px`,
        '--rn-alert-radius-sm': `${BORDER_RADIUS.medium}px`,
        '--rn-alert-spacing': `${SPACING.lg}px`,
        '--rn-alert-spacing-sm': `${SPACING.sm}px`,

        // Typography
        '--rn-alert-font-size': `${FONT_SIZES.md}px`,
        '--rn-alert-title-size': `${FONT_SIZES.xl}px`,
    };

    Object.entries(vars).forEach(([key, value]) => {
        root.style.setProperty(key, value);
    });
}
