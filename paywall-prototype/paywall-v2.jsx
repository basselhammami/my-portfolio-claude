// PaywallV2.jsx — Stillwater, visually upgraded
// More atmosphere, richer iconography, elegant typography, premium feel.

const V2 = {
  bg: '#14101C',
  ink: '#F6F0E4',
  inkDim: 'rgba(246,240,228,0.58)',
  inkFaint: 'rgba(246,240,228,0.32)',
  accent: '#F2CFCF',
  accentInk: '#241219',
  gold: '#E8B873',
  rose: '#D9A0B4',
  teal: '#8ECFBE',
  lilac: '#C6B2E3',
  sky: '#A6C9E3',
  coral: '#EFA592',
};

// Ambient aurora backdrop
function Aurora() {
  return (
    <div aria-hidden="true" style={{
      position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: -80, left: -60, width: 320, height: 320,
        background: 'radial-gradient(circle, rgba(217,160,180,0.35), transparent 70%)',
        filter: 'blur(10px)',
      }}/>
      <div style={{
        position: 'absolute', top: 120, right: -80, width: 280, height: 280,
        background: 'radial-gradient(circle, rgba(142,207,190,0.18), transparent 70%)',
        filter: 'blur(10px)',
      }}/>
      <div style={{
        position: 'absolute', bottom: -60, left: -40, width: 340, height: 340,
        background: 'radial-gradient(circle, rgba(198,178,227,0.18), transparent 70%)',
        filter: 'blur(12px)',
      }}/>
      {/* grain */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.14, mixBlendMode: 'overlay' }}>
        <filter id="n2"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/></filter>
        <rect width="100%" height="100%" filter="url(#n2)"/>
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Premium icon orbs — gradient bg + original glyph
// ─────────────────────────────────────────────────────────────
function IconOrb({ id, glyph, from, to, size = 58 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `radial-gradient(circle at 30% 25%, ${from} 0%, ${to} 90%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: `0 8px 22px ${to}55, inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -3px 8px rgba(0,0,0,0.18)`,
      position: 'relative',
    }}>
      {/* specular highlight */}
      <div style={{
        position: 'absolute', top: 5, left: 10, width: 16, height: 10,
        background: 'radial-gradient(ellipse, rgba(255,255,255,0.5), transparent 70%)',
        borderRadius: '50%',
      }}/>
      {glyph}
    </div>
  );
}

const Glyphs = {
  ripple: (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      <circle cx="15" cy="15" r="3" fill="#fff"/>
      <circle cx="15" cy="15" r="7" stroke="#fff" strokeOpacity="0.7" strokeWidth="1.4"/>
      <circle cx="15" cy="15" r="11" stroke="#fff" strokeOpacity="0.4" strokeWidth="1.2"/>
    </svg>
  ),
  breath: (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      <ellipse cx="15" cy="15" rx="5.5" ry="11" stroke="#fff" strokeWidth="1.4" transform="rotate(45 15 15)"/>
      <ellipse cx="15" cy="15" rx="5.5" ry="11" stroke="#fff" strokeWidth="1.4" transform="rotate(-45 15 15)"/>
      <circle cx="15" cy="15" r="2" fill="#fff"/>
    </svg>
  ),
  journal: (
    <svg width="26" height="28" viewBox="0 0 26 28" fill="none">
      <rect x="3" y="3" width="20" height="22" rx="2.5" stroke="#fff" strokeWidth="1.4"/>
      <line x1="7" y1="10" x2="19" y2="10" stroke="#fff" strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="7" y1="14" x2="19" y2="14" stroke="#fff" strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="7" y1="18" x2="14" y2="18" stroke="#fff" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  sleep: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M22 17a8 8 0 01-11-11 8 8 0 1011 11z" fill="#fff" fillOpacity="0.9"/>
      <circle cx="23" cy="7" r="1" fill="#fff"/>
      <circle cx="25" cy="11" r="0.7" fill="#fff"/>
    </svg>
  ),
  sounds: (
    <svg width="30" height="24" viewBox="0 0 30 24" fill="none">
      <rect x="2" y="10" width="2.4" height="4" rx="1.2" fill="#fff"/>
      <rect x="7" y="6" width="2.4" height="12" rx="1.2" fill="#fff"/>
      <rect x="12" y="2" width="2.4" height="20" rx="1.2" fill="#fff"/>
      <rect x="17" y="6" width="2.4" height="12" rx="1.2" fill="#fff"/>
      <rect x="22" y="10" width="2.4" height="4" rx="1.2" fill="#fff"/>
    </svg>
  ),
  coach: (
    <svg width="30" height="26" viewBox="0 0 30 26" fill="none">
      <path d="M4 4h22a2 2 0 012 2v12a2 2 0 01-2 2H14l-6 4v-4H4a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round"/>
      <circle cx="11" cy="12" r="1.3" fill="#fff"/>
      <circle cx="15" cy="12" r="1.3" fill="#fff"/>
      <circle cx="19" cy="12" r="1.3" fill="#fff"/>
    </svg>
  ),
};

const FEATURES_V2 = [
  { key: 'ground',  label: 'Grounding',   glyph: Glyphs.ripple,  from: '#A6C9E3', to: '#5E8BB8' },
  { key: 'breath',  label: 'Breathwork',  glyph: Glyphs.breath,  from: '#F2CFCF', to: '#C87A91' },
  { key: 'journal', label: 'Journal',     glyph: Glyphs.journal, from: '#C6B2E3', to: '#8869B5' },
  { key: 'sleep',   label: 'Sleep',       glyph: Glyphs.sleep,   from: '#EAD4A1', to: '#B6894A' },
  { key: 'sounds',  label: 'Soundscapes', glyph: Glyphs.sounds,  from: '#EFA592', to: '#B56552' },
  { key: 'coach',   label: 'Coach',       glyph: Glyphs.coach,   from: '#8ECFBE', to: '#4E9A83' },
];

function FeatureV2({ feature }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <IconOrb glyph={feature.glyph} from={feature.from} to={feature.to} size={58}/>
      <div style={{
        fontFamily: 'Manrope, system-ui, sans-serif',
        fontSize: 12.5, fontWeight: 500, color: V2.ink,
        letterSpacing: 0.1,
      }}>{feature.label}</div>
    </div>
  );
}

// Variant A: Squircle tiles (iOS app-icon feel) — tonal flat + inner glow
function FeatureSquircle({ feature }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: 54, height: 54, borderRadius: 16,
        background: `linear-gradient(160deg, ${feature.from}33, ${feature.to}22)`,
        border: `1px solid ${feature.from}44`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `inset 0 1px 0 ${feature.from}30`,
        color: feature.from,
      }}>
        {React.cloneElement(feature.glyph, {}, ...React.Children.map(feature.glyph.props.children, (child) => {
          if (!child) return child;
          const patched = {};
          if (child.props.fill && child.props.fill === '#fff') patched.fill = feature.from;
          if (child.props.stroke && child.props.stroke === '#fff') patched.stroke = feature.from;
          return React.cloneElement(child, patched);
        }))}
      </div>
      <div style={{
        fontFamily: 'Manrope, system-ui, sans-serif',
        fontSize: 12.5, fontWeight: 500, color: V2.ink, letterSpacing: 0.1,
      }}>{feature.label}</div>
    </div>
  );
}

// Variant B: Outlined minimal — no backdrop, mono color, elegant
function FeatureMono({ feature }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: 54, height: 54,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: V2.accent,
      }}>
        {React.cloneElement(feature.glyph, {}, ...React.Children.map(feature.glyph.props.children, (child) => {
          if (!child) return child;
          const patched = {};
          if (child.props.fill && child.props.fill === '#fff') patched.fill = V2.accent;
          if (child.props.stroke && child.props.stroke === '#fff') patched.stroke = V2.accent;
          return React.cloneElement(child, patched);
        }))}
      </div>
      <div style={{
        fontFamily: 'Manrope, system-ui, sans-serif',
        fontSize: 12.5, fontWeight: 500, color: V2.ink, letterSpacing: 0.1,
      }}>{feature.label}</div>
    </div>
  );
}

// Variant C: Ticks — checked list (2-column), no icon grid
function FeatureTicks({ features }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 1fr',
      columnGap: 16, rowGap: 12,
    }}>
      {features.map(f => (
        <div key={f.key} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          fontFamily: 'Manrope, system-ui, sans-serif',
          fontSize: 14, color: V2.ink, letterSpacing: 0.1,
        }}>
          <div style={{
            width: 20, height: 20, borderRadius: '50%',
            background: `linear-gradient(135deg, ${V2.rose}, ${V2.accent})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(242,207,207,0.25)',
          }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M1.5 5l2.5 2.5L8.5 2.5" stroke={V2.accentInk} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span>{f.label}</span>
        </div>
      ))}
    </div>
  );
}

// Variant D: Constellation — tiny dotted ring + mono glyph, airy
function FeatureConstellation({ feature }) {
  const dots = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    return { x: 27 + Math.cos(a) * 24, y: 27 + Math.sin(a) * 24 };
  });
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 54, height: 54, position: 'relative' }}>
        <svg width="54" height="54" viewBox="0 0 54 54" style={{ position: 'absolute', inset: 0 }}>
          {dots.map((d, i) => (
            <circle key={i} cx={d.x} cy={d.y} r="0.9" fill={V2.accent} opacity={0.35 + (i % 3) * 0.15}/>
          ))}
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: V2.accent,
        }}>
          <div style={{ transform: 'scale(0.8)' }}>
            {React.cloneElement(feature.glyph, {}, ...React.Children.map(feature.glyph.props.children, (child) => {
              if (!child) return child;
              const patched = {};
              if (child.props.fill && child.props.fill === '#fff') patched.fill = V2.accent;
              if (child.props.stroke && child.props.stroke === '#fff') patched.stroke = V2.accent;
              return React.cloneElement(child, patched);
            }))}
          </div>
        </div>
      </div>
      <div style={{
        fontFamily: 'Manrope, system-ui, sans-serif',
        fontSize: 12.5, fontWeight: 500, color: V2.ink, letterSpacing: 0.1,
      }}>{feature.label}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Plan card — vertical, price-led
// ─────────────────────────────────────────────────────────────
function PlanCardV2({ plan, selected, onSelect, badge }) {
  return (
    <button
      onClick={onSelect}
      style={{
        position: 'relative',
        flex: 1, minWidth: 0,
        background: selected
          ? 'linear-gradient(165deg, rgba(242,207,207,0.14), rgba(198,178,227,0.08))'
          : 'rgba(246,240,228,0.035)',
        border: `1px solid ${selected ? 'rgba(242,207,207,0.7)' : 'rgba(246,240,228,0.1)'}`,
        borderRadius: 20,
        padding: '18px 10px 16px',
        textAlign: 'center',
        cursor: 'pointer',
        height: 172,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        transition: 'all 200ms ease',
        fontFamily: 'Manrope, system-ui, sans-serif',
        color: V2.ink,
        boxShadow: selected ? '0 10px 30px rgba(242,207,207,0.15)' : 'none',
      }}
    >
      {badge && (
        <div style={{
          position: 'absolute', top: -11, left: '50%',
          transform: 'translateX(-50%)',
          background: `linear-gradient(135deg, ${V2.rose}, ${V2.accent})`,
          color: V2.accentInk,
          fontSize: 10, fontWeight: 800, letterSpacing: 0.8,
          padding: '4px 10px', borderRadius: 100,
          whiteSpace: 'nowrap',
          boxShadow: '0 4px 12px rgba(217,160,180,0.35)',
        }}>{badge}</div>
      )}
      <div style={{
        fontFamily: '"Lora", Georgia, serif', fontWeight: 500,
        fontSize: 15, letterSpacing: -0.2,
        color: V2.inkDim,
        marginBottom: 10,
      }}>{plan.title}</div>

      <div style={{
        fontFamily: '"Lora", Georgia, serif', fontWeight: 500,
        fontSize: 26, lineHeight: '30px', letterSpacing: -0.8,
        color: V2.ink,
      }}>{plan.price}</div>

      <div style={{
        fontSize: 10.5, color: V2.inkDim,
        marginTop: 2, letterSpacing: 0.2,
      }}>{plan.per}</div>

      <div style={{ flex: 1 }}/>

      <div style={{
        fontSize: 10.5, color: V2.inkFaint, lineHeight: '14px',
        letterSpacing: 0.1,
      }}>{plan.foot}</div>

      {/* radio indicator */}
      <div style={{
        position: 'absolute', top: 10, right: 10,
        width: 16, height: 16, borderRadius: '50%',
        border: `1.5px solid ${selected ? V2.accent : 'rgba(246,240,228,0.25)'}`,
        background: selected ? V2.accent : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 200ms ease',
      }}>
        {selected && (
          <svg width="8" height="8" viewBox="0 0 8 8">
            <path d="M1 4l2 2 4-4" stroke={V2.accentInk} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Hero ripple illustration — original, animated
// ─────────────────────────────────────────────────────────────
function HeroRipple() {
  return (
    <div style={{
      width: 110, height: 110, position: 'relative',
      margin: '0 auto',
    }}>
      <style>{`
        @keyframes v2pulse { 0%,100% { transform: scale(1); opacity: 0.9 } 50% { transform: scale(1.08); opacity: 1 } }
        @keyframes v2ring1 { 0% { transform: scale(0.6); opacity: 0.9 } 100% { transform: scale(1.6); opacity: 0 } }
        @keyframes v2ring2 { 0% { transform: scale(0.6); opacity: 0.6 } 100% { transform: scale(1.9); opacity: 0 } }
      `}</style>
      {/* rings */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        border: '1px solid rgba(242,207,207,0.5)',
        animation: 'v2ring1 3.5s ease-out infinite',
      }}/>
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        border: '1px solid rgba(198,178,227,0.4)',
        animation: 'v2ring2 3.5s ease-out infinite 1s',
      }}/>
      {/* core orb */}
      <div style={{
        position: 'absolute', inset: '22%', borderRadius: '50%',
        background: `radial-gradient(circle at 35% 30%, #F2CFCF, #C6B2E3 60%, #7A5C9E 100%)`,
        boxShadow: '0 10px 40px rgba(242,207,207,0.45), inset 0 2px 6px rgba(255,255,255,0.3), inset 0 -5px 12px rgba(40,20,60,0.4)',
        animation: 'v2pulse 3.5s ease-in-out infinite',
      }}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// V2 main
// ─────────────────────────────────────────────────────────────
function PaywallV2({ tweaks }) {
  const [selected, setSelected] = React.useState('annual');

  const plans = {
    monthly:  { title: 'Monthly',  price: '$5.99',  per: 'per month',          foot: 'Billed monthly' },
    annual:   { title: 'Annual',   price: '$29.99', per: '$2.50/month',         foot: '7 days free, then billed yearly' },
    lifetime: { title: 'Lifetime', price: '$79.99', per: 'one-time',            foot: 'Pay once, keep forever' },
  };

  const foot = {
    monthly:  'Billed $5.99 monthly. Cancel anytime.',
    annual:   'Free for 7 days, then $29.99/year. Cancel anytime.',
    lifetime: 'One-time payment. Lifetime access.',
  };

  return (
    <div style={{
      height: '100%', background: V2.bg,
      display: 'flex', flexDirection: 'column',
      color: V2.ink, position: 'relative',
      paddingTop: 64,
    }}>
      <Aurora/>

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Top close + wordmark */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '10px 20px 0', position: 'relative',
        }}>
          <button style={{
            position: 'absolute', left: 18, top: 4,
            width: 32, height: 32, borderRadius: '50%',
            background: 'rgba(246,240,228,0.06)',
            border: '1px solid rgba(246,240,228,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: V2.inkDim,
          }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </button>
          <span style={{
            fontFamily: 'Manrope, system-ui, sans-serif',
            fontSize: 17, fontWeight: 600, letterSpacing: -0.3,
            color: V2.ink,
          }}>stillwater</span>
        </div>

        {/* Hero + headline */}
        <div style={{ padding: '16px 30px 0', textAlign: 'center' }}>
          <HeroRipple/>
          <div style={{
            fontFamily: '"Lora", Georgia, serif',
            fontWeight: 500,
            fontSize: 32, lineHeight: '36px',
            letterSpacing: -0.5,
            color: V2.ink,
            textWrap: 'pretty',
            marginTop: 14,
          }}>
            {tweaks.headline.split(' ').map((w, i, arr) => (
              i === arr.length - 1
                ? <span key={i} style={{ fontStyle: 'italic', color: V2.accent }}>{w}</span>
                : <span key={i}>{w} </span>
            ))}
          </div>
          <div style={{
            fontFamily: 'Manrope, system-ui, sans-serif',
            fontSize: 13, color: V2.inkDim,
            marginTop: 8, letterSpacing: 0.1,
          }}>Unlock the complete practice.</div>
        </div>

        {/* Feature grid */}
        <div style={{ padding: '26px 22px 0' }}>
          {tweaks.featureStyle === 'ticks' ? (
            <FeatureTicks features={FEATURES_V2}/>
          ) : (
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
              rowGap: 20, columnGap: 8,
            }}>
              {FEATURES_V2.map(f => {
                const Cell = {
                  squircle:      FeatureSquircle,
                  mono:          FeatureMono,
                  constellation: FeatureConstellation,
                  orbs:          FeatureV2,
                }[tweaks.featureStyle] || FeatureSquircle;
                return <Cell key={f.key} feature={f}/>;
              })}
            </div>
          )}
        </div>

        {/* Plan cards */}
        <div style={{
          padding: '32px 16px 0',
          display: 'flex', gap: 8,
        }}>
          <PlanCardV2 plan={plans.monthly}  selected={selected === 'monthly'}  onSelect={() => setSelected('monthly')}/>
          <PlanCardV2 plan={plans.annual}   selected={selected === 'annual'}   onSelect={() => setSelected('annual')}   badge="SAVE 58%"/>
          <PlanCardV2 plan={plans.lifetime} selected={selected === 'lifetime'} onSelect={() => setSelected('lifetime')}/>
        </div>

        {/* CTA */}
        <div style={{ padding: '22px 20px 0' }}>
          <button style={{
            width: '100%', height: 58, borderRadius: 100,
            background: `linear-gradient(180deg, #FBE0E0 0%, ${V2.accent} 100%)`,
            color: V2.accentInk,
            border: 0, cursor: 'pointer',
            fontFamily: '"Lora", Georgia, serif',
            fontWeight: 500,
            fontSize: 19, letterSpacing: 0.1,
            boxShadow: '0 14px 34px rgba(242, 207, 207, 0.28), inset 0 1px 0 rgba(255,255,255,0.5)',
            position: 'relative',
          }}>{tweaks.cta}</button>
          <div style={{
            textAlign: 'center',
            fontFamily: 'Manrope, system-ui, sans-serif',
            fontSize: 11, color: V2.inkFaint,
            marginTop: 10, letterSpacing: 0.2,
          }}>{foot[selected]}</div>
        </div>

        {/* Footer links */}
        <div style={{
          marginTop: 'auto',
          padding: '18px 0 40px',
          display: 'flex', justifyContent: 'center', gap: 28,
          fontFamily: 'Manrope, system-ui, sans-serif',
          fontSize: 12, color: V2.inkFaint,
        }}>
          <span>Restore</span>
          <span>Terms</span>
          <span>Privacy</span>
        </div>
      </div>
    </div>
  );
}

window.PaywallV2 = PaywallV2;
