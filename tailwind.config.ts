import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
        darkMode: ["class"],
        content: [
                "./client/index.html",
                "./client/src/**/*.{ts,tsx}",
        ],
        prefix: "",
        theme: {
                container: {
                        center: true,
                        padding: '2rem',
                        screens: {
                                '2xl': '1400px'
                        }
                },
                extend: {
                        fontFamily: {
                                sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'system-ui', 'sans-serif'],
                        },
                        fontSize: {
                                'display': ['2.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
                                'h1':      ['2rem',   { lineHeight: '1.2', letterSpacing: '-0.01em' }],
                                'h2':      ['1.5rem', { lineHeight: '1.3' }],
                                'h3':      ['1.25rem',{ lineHeight: '1.4' }],
                                'h4':      ['1.125rem',{ lineHeight: '1.4' }],
                                'body':    ['1rem',   { lineHeight: '1.5' }],
                                'body-sm': ['0.875rem',{ lineHeight: '1.5' }],
                                'caption': ['0.75rem', { lineHeight: '1.4' }],
                                'overline':['0.6875rem',{ lineHeight: '1.4', letterSpacing: '0.05em' }],
                        },
                        spacing: {
                                'xs':  '0.25rem',
                                'sm':  '0.5rem',
                                'md':  '1rem',
                                'lg':  '1.5rem',
                                'xl':  '2rem',
                                '2xl': '3rem',
                                '3xl': '4rem',
                        },
                        borderRadius: {
                                'none': '0',
                                'xs':   '0.125rem',
                                'sm':   '0.25rem',
                                'md':   '0.5rem',
                                'lg':   '0.75rem',
                                'xl':   '1rem',
                                '2xl':  '1.5rem',
                                'full': '9999px',
                        },
                        colors: {
                                border: {
                                        DEFAULT: 'hsl(var(--border))',
                                        strong: 'hsl(var(--border-strong, var(--border)))',
                                        subtle: 'hsl(var(--border-subtle, var(--muted)))'
                                },
                                input: 'hsl(var(--input))',
                                ring: 'hsl(var(--ring))',
                                background: {
                                        DEFAULT: 'hsl(var(--background))',
                                        subtle: 'hsl(var(--background-subtle))'
                                },
                                foreground: 'hsl(var(--foreground))',
                                surface: {
                                        DEFAULT:  'hsl(var(--card))',
                                        elevated: 'hsl(var(--card))',
                                        overlay:  'hsl(var(--popover))'
                                },
                                info: {
                                        DEFAULT:    'hsl(var(--info, 210 92% 45%))',
                                        light:      'hsl(var(--info-light, 210 100% 92%))',
                                        foreground: 'hsl(var(--info-foreground, 0 0% 100%))'
                                },
                                primary: {
                                        DEFAULT: 'hsl(var(--primary))',
                                        light: 'hsl(var(--primary-light))',
                                        dark: 'hsl(var(--primary-dark))',
                                        glow: 'hsl(var(--primary-glow))',
                                        foreground: 'hsl(var(--primary-foreground))'
                                },
                                secondary: {
                                        DEFAULT: 'hsl(var(--secondary))',
                                        light: 'hsl(var(--secondary-light))',
                                        foreground: 'hsl(var(--secondary-foreground))'
                                },
                                success: {
                                        DEFAULT: 'hsl(var(--success))',
                                        light: 'hsl(var(--success-light))',
                                        foreground: 'hsl(var(--success-foreground))'
                                },
                                warning: {
                                        DEFAULT: 'hsl(var(--warning))',
                                        light: 'hsl(var(--warning-light))',
                                        foreground: 'hsl(var(--warning-foreground))'
                                },
                                destructive: {
                                        DEFAULT: 'hsl(var(--destructive))',
                                        light: 'hsl(var(--destructive-light))',
                                        foreground: 'hsl(var(--destructive-foreground))'
                                },
                                macros: {
                                        protein: 'hsl(var(--protein))',
                                        carbs: 'hsl(var(--carbs))',
                                        fats: 'hsl(var(--fats))',
                                        calories: 'hsl(var(--calories))'
                                },
                                muted: {
                                        DEFAULT: 'hsl(var(--muted))',
                                        foreground: 'hsl(var(--muted-foreground))',
                                        border: 'hsl(var(--muted-border))'
                                },
                                accent: {
                                        DEFAULT: 'hsl(var(--accent))',
                                        foreground: 'hsl(var(--accent-foreground))'
                                },
                                popover: {
                                        DEFAULT: 'hsl(var(--popover))',
                                        foreground: 'hsl(var(--popover-foreground))'
                                },
                                card: {
                                        DEFAULT: 'hsl(var(--card))',
                                        hover: 'hsl(var(--card-hover))',
                                        foreground: 'hsl(var(--card-foreground))'
                                },
                                sidebar: {
                                        DEFAULT: 'hsl(var(--sidebar-background))',
                                        foreground: 'hsl(var(--sidebar-foreground))',
                                        primary: 'hsl(var(--sidebar-primary))',
                                        'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
                                        accent: 'hsl(var(--sidebar-accent))',
                                        'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
                                        border: 'hsl(var(--sidebar-border))',
                                        ring: 'hsl(var(--sidebar-ring))'
                                }
                        },
                        boxShadow: {
                                'sm': 'var(--shadow-sm)',
                                'md': '0 4px 6px -1px rgb(0 0 0 / 0.06), 0 2px 4px -2px rgb(0 0 0 / 0.04)',
                                'lg': '0 10px 15px -3px rgb(0 0 0 / 0.06), 0 4px 6px -4px rgb(0 0 0 / 0.03)',
                                'xl': '0 20px 25px -5px rgb(0 0 0 / 0.06), 0 8px 10px -6px rgb(0 0 0 / 0.03)',
                                'card': 'var(--shadow-card)',
                                'widget': 'var(--shadow-widget)',
                        },
                        transitionDuration: {
                                'fast':   '150ms',
                                'normal': '250ms',
                                'slow':   '400ms',
                        },
                        keyframes: {
                                'accordion-down': {
                                        from: {
                                                height: '0'
                                        },
                                        to: {
                                                height: 'var(--radix-accordion-content-height)'
                                        }
                                },
                                'accordion-up': {
                                        from: {
                                                height: 'var(--radix-accordion-content-height)'
                                        },
                                        to: {
                                                height: '0'
                                        }
                                },
                                'pulse-glow': {
                                        '0%, 100%': {
                                                opacity: '1',
                                                transform: 'scale(1)'
                                        },
                                        '50%': {
                                                opacity: '0.8',
                                                transform: 'scale(1.02)'
                                        }
                                },
                                'slide-up': {
                                        from: {
                                                opacity: '0',
                                                transform: 'translateY(10px)'
                                        },
                                        to: {
                                                opacity: '1',
                                                transform: 'translateY(0)'
                                        }
                                },
                                'fade-in': {
                                        from: { opacity: '0' },
                                        to:   { opacity: '1' }
                                },
                                'scale-in': {
                                        from: { opacity: '0', transform: 'scale(0.95)' },
                                        to:   { opacity: '1', transform: 'scale(1)' }
                                },
                        },
                        animation: {
                                'accordion-down': 'accordion-down 0.2s ease-out',
                                'accordion-up': 'accordion-up 0.2s ease-out',
                                'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
                                'slide-up': 'slide-up 0.3s ease-out',
                                'fade-in': 'fade-in 0.25s ease-out',
                                'scale-in': 'scale-in 0.2s ease-out',
                        }
                }
        },
        plugins: [tailwindcssAnimate],
} satisfies Config;
