import type { Config } from "tailwindcss"

/**
 * Holidaze — Tailwind v3 config.
 * Atlas Press palette + three-typeface discipline + fluid type scale
 * ported from the prototype's css/base.css. Hard edges are enforced at the config layer.
 */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],

  /* Screens — base (mobile, 360+), sm (640+), md (tablet, 768+), nav (topbar collapse,
     960+, mirrors the prototype's hamburger gate), lg (desktop, 1440+). */
  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      nav: "960px",
      lg: "1440px",
    },

    /* No rounded corners anywhere. `rounded` and `rounded-*` will not generate. */
    borderRadius: {
      none: "0",
    },

    extend: {
      colors: {
        /* Grounds */
        ivory: {
          DEFAULT: "#F5EEDD",
          soft: "#FAF4E5",
          deep: "#E6DDC5",
        },
        /* Legacy alias used throughout the prototype CSS — same colour as ivory. */
        bone: {
          DEFAULT: "#F5EEDD",
          soft: "#FAF4E5",
          deep: "#E6DDC5",
        },

        /* Type */
        ink: {
          DEFAULT: "#0F0E0B",
          soft: "#2A2720",
          mute: "#5F594A",
        },

        /* Hot emphasis — italic <em>, index chips, primary hover, selection */
        cinnabar: {
          DEFAULT: "#B8371D",
          deep: "#8A2612",
          soft: "#D9604A",
        },
        /* Legacy alias for cinnabar */
        terracotta: {
          DEFAULT: "#B8371D",
          deep: "#8A2612",
          soft: "#D9604A",
        },

        /* Cold grounding — eyebrow labels, nav underlines, CTA fill, cover backgrounds */
        lapis: {
          DEFAULT: "#1E3358",
          deep: "#111E38",
        },
        cobalt: {
          DEFAULT: "#1E3358",
          deep: "#111E38",
        },

        /* Warm highlight — rating dots, asterisks, offline pulse */
        saffron: {
          DEFAULT: "#D4A130",
          deep: "#A67C1F",
        },
        ochre: {
          DEFAULT: "#D4A130",
          deep: "#A67C1F",
        },

        /* Operational-only — live pulse */
        bistre: {
          DEFAULT: "#5F7A47",
        },
        sage: {
          DEFAULT: "#5F7A47",
        },

        /* Hairline rules (used for tickmarks, card corners, gridlines, section borders) */
        rule: "rgb(15 14 11 / 0.15)",
        "rule-strong": "rgb(15 14 11 / 0.33)",
      },

      /* Three faces, three jobs. Do not add a fourth. */
      fontFamily: {
        /* Fraunces — display, drop-caps, subheads, body, spec values, lede.
           One variable face carrying opsz 9..144. */
        display: ["Fraunces", "Georgia", "serif"],
        serif: ["Fraunces", "Georgia", "serif"],
        /* Bricolage Grotesque — UI body, buttons, form labels */
        sans: ["\"Bricolage Grotesque\"", "ui-sans-serif", "system-ui", "sans-serif"],
        /* JetBrains Mono — labels, coordinates, chips, numbers, ticket codes */
        mono: ["\"JetBrains Mono\"", "ui-monospace", "Menlo", "monospace"],
      },

      /* Fluid scale with brutalist jumps. Mirrors css/base.css --step-* tokens. */
      fontSize: {
        "step--2": "clamp(0.72rem, 0.70rem + 0.10vw, 0.78rem)",
        "step--1": "clamp(0.83rem, 0.80rem + 0.15vw, 0.90rem)",
        "step-0":  "clamp(1.00rem, 0.95rem + 0.25vw, 1.10rem)",
        "step-1":  "clamp(1.18rem, 1.10rem + 0.40vw, 1.35rem)",
        "step-2":  "clamp(1.45rem, 1.30rem + 0.75vw, 1.75rem)",
        "step-3":  "clamp(1.95rem, 1.60rem + 1.75vw, 2.75rem)",
        "step-4":  "clamp(2.75rem, 2.00rem + 3.75vw, 4.50rem)",
        "step-5":  "clamp(3.75rem, 2.50rem + 6.25vw, 7.00rem)",
        "step-6":  "clamp(4.50rem, 2.75rem + 8.75vw, 9.50rem)",
      },

      /* Editorial rhythm tokens. Use as p-gutter, py-shelf, etc. */
      spacing: {
        gutter: "clamp(1.25rem, 0.75rem + 2.5vw, 3rem)",
        shelf: "clamp(4rem, 2.5rem + 7.5vw, 8rem)",
      },

      /* Motion tokens — match the prototype's durations/easings */
      transitionTimingFunction: {
        "out-quint": "cubic-bezier(0.19, 1, 0.22, 1)",
        "inout-quint": "cubic-bezier(0.65, 0, 0.35, 1)",
      },
      transitionDuration: {
        fast: "180ms",
        med: "360ms",
        slow: "640ms",
      },

      /* Letter-spacing presets used by eyebrows, mono labels, running heads */
      letterSpacing: {
        eyebrow: "0.14em",
        runhead: "0.22em",
      },

      /* Cinnabar focus-visible outline, 2px, 3px offset (brand + a11y spec) */
      outlineWidth: {
        focus: "2px",
      },
      outlineOffset: {
        focus: "3px",
      },

      /* Z-index scale — named layers, no magic numbers in component code.
         Mirrors prototype usage (grain=200, topbar=90, modal-backdrop=80, intro=9999). */
      zIndex: {
        base: "0",
        raised: "1",
        sticky: "40",
        modal: "95",
        "modal-backdrop": "80",
        topbar: "90",
        grain: "200",
        toast: "999",
        intro: "9999",
      },

      /* Aspect ratios used in venue cards, hero plates, atlas plates. */
      aspectRatio: {
        card: "3 / 2",
        cover: "4 / 3",
        atlas: "2 / 1",
        "atlas-wide": "2.2 / 1",
      },
    },
  },

  plugins: [],
} satisfies Config
