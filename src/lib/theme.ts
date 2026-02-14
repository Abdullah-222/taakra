/**
 * ======================================================
 * TAAKRA SNOWY GLASS DESIGN SYSTEM (WINTER MORNING EDITION)
 * ======================================================
 *
 * PURPOSE:
 * Central theme configuration for the entire application.
 * Import this file in any component to maintain visual consistency.
 *
 * Designed for:
 * - Snowy aesthetic (Light: "Winter Morning" / Dark: "Midnight Blizzard")
 * - Premium Glassmorphism UI
 * - Dynamic Variable Support
 *
 * Cursor Hint:
 * Always reference colors from this file instead of hardcoding.
 */

export const theme = {
    /**
     * --------------------------------------------------
     * BASE COLORS (Mapped to CSS Variables)
     * --------------------------------------------------
     */

    colors: {
        // Main Backgrounds
        snowWhite: "var(--color-snow-white)",
        offWhite: "var(--color-off-white)",

        // Frost / Ice Gradients
        frost50: "var(--color-frost-50)",
        frost100: "var(--color-frost-100)",
        frost200: "var(--color-frost-200)",
        frost300: "var(--color-frost-300)",
        frost400: "var(--color-frost-400)",

        // Primary Brand Colors (Glacier Blue)
        glacier500: "var(--color-glacier-500)",
        glacier600: "var(--color-glacier-600)",

        // Text
        textPrimary: "var(--color-text-primary)",
        textSecondary: "var(--color-text-secondary)",
        textMuted: "var(--color-text-muted)",
        textInverse: "var(--color-text-inverse)",

        // Dark Ice (Legacy / Fallback)
        darkIce: "#020617",

        // Status Colors (Static)
        success: "#10b981",
        warning: "#f59e0b",
        danger: "#ef4444",
    },

    /**
     * --------------------------------------------------
     * GLASSMORPHISM TOKENS (Frosted Glass)
     * --------------------------------------------------
     */

    glass: {
        background: "var(--glass-bg)",
        border: "1px solid var(--glass-border)",
        shadow: "var(--glass-shadow)",
        blur: "var(--glass-blur)",
    },

    // Legacy mapping (can be removed later if not used directly)
    glassDark: {
        background: "rgba(15, 23, 42, 0.65)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        shadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
        blur: "blur(12px)",
    },

    /**
     * --------------------------------------------------
     * GLOW & LIGHT EFFECTS
     * --------------------------------------------------
     */

    glow: {
        subtle: "0 0 20px rgba(186, 224, 255, 0.5)",
        strong: "0 0 40px rgba(54, 158, 255, 0.4)",
    },

    /**
     * --------------------------------------------------
     * BORDER RADIUS SYSTEM
     * --------------------------------------------------
     */

    radius: {
        sm: "12px",
        md: "20px",
        lg: "32px", // Highly rounded for modern feel
        xl: "48px",
    },

    /**
     * --------------------------------------------------
     * SPACING SCALE
     * --------------------------------------------------
     */

    spacing: {
        xs: "8px",
        sm: "16px",
        md: "24px",
        lg: "40px",
        xl: "64px",
    },

    /**
     * --------------------------------------------------
     * TYPOGRAPHY
     * --------------------------------------------------
     */

    typography: {
        heading: "font-bold tracking-tight text-[var(--color-text-primary)]",
        body: "text-base text-[var(--color-text-secondary)]",
        label: "text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider",
    },

    /**
     * --------------------------------------------------
     * BUTTON PRESETS
     * --------------------------------------------------
     */

    buttons: {
        primary: {
            background: "linear-gradient(135deg, var(--color-glacier-500) 0%, var(--color-glacier-600) 100%)",
            color: "#ffffff",
            radius: "20px",
            shadow: "0 4px 14px rgba(0, 122, 255, 0.4)",
            hoverTransform: "translateY(-2px)",
        },

        ghost: {
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid var(--color-glacier-500)",
            color: "var(--color-glacier-500)",
            hoverBackground: "var(--glass-bg)",
        },
    },

    /**
     * --------------------------------------------------
     * INPUT STYLES
     * --------------------------------------------------
     */

    inputs: {
        background: "var(--input-bg)",
        border: "1px solid var(--input-border)",
        focusBorder: "1px solid var(--color-glacier-500)",
        focusRing: "0 0 0 4px rgba(54, 158, 255, 0.15)",
        radius: "16px",
        placeholder: "var(--color-text-muted)",
        text: "var(--input-text)",
    },

    /**
     * --------------------------------------------------
     * ANIMATIONS (Framer Motion friendly)
     * --------------------------------------------------
     */

    animation: {
        fast: "0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        normal: "0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        bounce: "0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    },
}
