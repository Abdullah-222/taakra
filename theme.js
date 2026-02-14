/**
 * ======================================================
 * TAAKRA SNOWY GLASS DESIGN SYSTEM
 * ======================================================
 *
 * PURPOSE:
 * Central theme configuration for the entire application.
 * Import this file in any component to maintain visual consistency.
 *
 * Designed for:
 * - Snowy aesthetic
 * - Glassmorphism UI
 * - Dark background
 * - AI dashboards
 * - Hackathon WOW factor
 *
 * Cursor Hint:
 * Always reference colors from this file instead of hardcoding.
 */

export const theme = {
    /**
     * --------------------------------------------------
     * BASE COLORS (Snow + Ice Palette)
     * --------------------------------------------------
     */
  
    colors: {
      snowWhite: "#f8fbff",
      iceWhite: "rgba(255,255,255,0.65)",
  
      frost100: "#e8f4ff",
      frost200: "#cce4ff",
      frost300: "#9cc9ff",
      frost400: "#6faaff",
  
      glacier500: "#3b82f6",
      glacier700: "#1e40af",
  
      darkIce: "#020617",
  
      success: "#22c55e",
      warning: "#facc15",
      danger: "#ef4444",
  
      textPrimary: "#f8fafc",
      textMuted: "#94a3b8",
    },
  
    /**
     * --------------------------------------------------
     * GLASSMORPHISM TOKENS
     * --------------------------------------------------
     */
  
    glass: {
      background: "rgba(255,255,255,0.08)",
      border: "rgba(255,255,255,0.18)",
      shadow: "0 8px 32px rgba(0,0,0,0.35)",
      blur: "blur(18px)",
    },
  
    /**
     * --------------------------------------------------
     * GLOW & LIGHT EFFECTS
     * --------------------------------------------------
     */
  
    glow: {
      ice: "0 0 30px rgba(150,200,255,.35)",
      strong: "0 0 40px rgba(150,200,255,.6)",
    },
  
    /**
     * --------------------------------------------------
     * BORDER RADIUS SYSTEM
     * --------------------------------------------------
     */
  
    radius: {
      sm: "10px",
      md: "14px",
      lg: "18px",
      xl: "22px",
    },
  
    /**
     * --------------------------------------------------
     * SPACING SCALE
     * --------------------------------------------------
     */
  
    spacing: {
      xs: "6px",
      sm: "12px",
      md: "20px",
      lg: "32px",
      xl: "48px",
    },
  
    /**
     * --------------------------------------------------
     * TYPOGRAPHY
     * --------------------------------------------------
     */
  
    typography: {
      heading: "font-bold tracking-tight",
      body: "text-base",
      muted: "text-slate-400",
    },
  
    /**
     * --------------------------------------------------
     * BUTTON PRESETS
     * --------------------------------------------------
     */
  
    buttons: {
      primary: {
        background: "linear-gradient(135deg,#9cc9ff,#3b82f6)",
        color: "#fff",
        radius: "18px",
        hoverGlow: "0 0 40px rgba(150,200,255,.6)",
      },
  
      ghost: {
        background: "transparent",
        border: "1px solid rgba(255,255,255,.2)",
        color: "#f8fafc",
      },
    },
  
    /**
     * --------------------------------------------------
     * INPUT STYLES
     * --------------------------------------------------
     */
  
    inputs: {
      background: "rgba(255,255,255,.06)",
      border: "1px solid rgba(255,255,255,.2)",
      radius: "14px",
    },
  
    /**
     * --------------------------------------------------
     * CARD STYLES
     * Used for competitions, dashboards, modals
     * --------------------------------------------------
     */
  
    cards: {
      background: "rgba(255,255,255,0.08)",
      border: "1px solid rgba(255,255,255,.18)",
      shadow: "0 8px 32px rgba(0,0,0,.35)",
      hover: "translateY(-6px) scale(1.02)",
    },
  
    /**
     * --------------------------------------------------
     * DEADLINE INDICATORS
     * --------------------------------------------------
     */
  
    deadline: {
      safe: "#22c55e",
      soon: "#facc15",
      urgent: "#ef4444",
    },
  
    /**
     * --------------------------------------------------
     * GAMIFICATION COLORS
     * --------------------------------------------------
     */
  
    badges: {
      starter: "#9cc9ff",
      master: "#3b82f6",
      legend: "#a78bfa",
    },
  
    /**
     * --------------------------------------------------
     * ANIMATIONS (Framer Motion friendly)
     * --------------------------------------------------
     */
  
    animation: {
      fast: "0.2s ease",
      normal: "0.4s ease",
      slow: "0.8s ease",
    },
  
    /**
     * --------------------------------------------------
     * CURSOR SYSTEM
     * --------------------------------------------------
     *
     * Place snowflake.svg in /public
     * Then apply:
     * document.body.style.cursor = theme.cursor.default
     */
  
    cursor: {
      default: "url('/snowflake.svg'), auto",
      pointer: "pointer",
    },
  
    /**
     * --------------------------------------------------
     * CURSOR AI NOTES
     * --------------------------------------------------
     *
     * Cursor Instruction:
     * - Use theme.colors instead of raw hex
     * - Use theme.glass for all cards
     * - Use theme.buttons.primary for CTAs
     * - Use theme.cards for competition UI
     *
     * This keeps UI consistent.
     */
  }
  