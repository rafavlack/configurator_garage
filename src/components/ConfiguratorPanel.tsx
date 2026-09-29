import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { DOOR_OPTIONS, ROOF_OPTIONS, ROOF_PITCHES, SIDING_OPTIONS, TRIM_OPTIONS } from '../data/catalog'
import { formatFeet } from '../lib/geometry'
import { makeShareUrl } from '../lib/share'
import { estimateGarage } from '../lib/pricing'
import { useGarageStore } from '../state/useGarageStore'

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

export function ConfiguratorPanel({ onCapture, onQuote }: { onCapture: () => void; onQuote: () => void }) {
  const { config, configureTab, setTab, updateDimensions, updateConfig, reset } = useGarageStore()
  const estimate = useMemo(() => estimateGarage(config), [config])
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        void navigator.clipboard?.writeText(makeShareUrl(config))
        setCopied(true)
        setTimeout(() => setCopied(false), 1600)
      }
    }
    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [config])

  const copyShare = async () => {
    await navigator.clipboard?.writeText(makeShareUrl(config))
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  return (
    <aside className="config-panel">

        <div className="config-header">
            <a
                className="back-to-site"
                href="https://www.thegaragebuilders.net/"
                aria-label="Return to The Garage Builders website"
                title="Return to The Garage Builders"
            >
    <span className="back-to-site-icon" aria-hidden="true">
      <svg
          viewBox="0 0 24 24"
          width="30"
          height="30"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
      >
        <path d="M3.5 10.5 12 3.5l8.5 7" />
        <path d="M5.5 9.5V20h13V9.5" />
        <path d="M9.5 20v-5.5h5V20" />
      </svg>
    </span>

                <span className="back-to-site-text">
      <strong>THE GARAGE BUILDERS</strong>
      <small>Garage Design Studio</small>
    </span>
            </a>
        </div>

        <div className="brand-mark">
            <div className="brand-kicker">CONFIGURATOR</div>
            <h1>Design your garage.</h1>
            <p>
                Configure the structure, exterior and openings, then request a project estimate.
            </p>
        </div>
        
      <div className="tabbar" role="tablist">
        {[
          ['size', 'Size'],
          ['exterior', 'Exterior'],
          ['openings', 'Openings'],
          ['options', 'Options'],
        ].map(([id, label]) => (
          <button key={id} className={configureTab === id ? 'active' : ''} onClick={() => setTab(id as typeof configureTab)}>{label}</button>
        ))}
      </div>

      <div className="panel-scroll">
        {configureTab === 'size' && (
          <section className="control-section">
            <div className="section-heading"><span>01</span><div><h2>Dimensions</h2><p>Set the footprint and wall height.</p></div></div>
            <DimensionInput label="Width" value={config.dimensions.width} min={16} max={60} step={2} suffix="ft" onChange={(v) => updateDimensions({ width: v })} />
            <DimensionInput label="Depth" value={config.dimensions.depth} min={16} max={80} step={2} suffix="ft" onChange={(v) => updateDimensions({ depth: v })} />
            <DimensionInput label="Wall height" value={config.dimensions.wallHeight} min={8} max={16} step={1} suffix="ft" onChange={(v) => updateDimensions({ wallHeight: v })} />
            <div className="dimension-summary"><strong>{formatFeet(config.dimensions.width)} × {formatFeet(config.dimensions.depth)}</strong><span>{Math.round(config.dimensions.width * config.dimensions.depth)} sq ft</span></div>
          </section>
        )}

        {configureTab === 'exterior' && (
          <section className="control-section">
            <div className="section-heading"><span>02</span><div><h2>Exterior</h2><p>Materials, colors and roof system.</p></div></div>
            <Label>Roof style</Label>
            <div className="choice-grid">
              {ROOF_OPTIONS.map((item) => <Choice key={item.id} selected={config.roof.material === item.id} title={item.name} subtitle={item.note} onClick={() => updateConfig('roof', { ...config.roof, material: item.id })} />)}
            </div>
            <Label>Roof pitch</Label>
            <div className="segmented">
              {ROOF_PITCHES.map((pitch) => <button key={pitch} className={config.roof.pitch === pitch ? 'selected' : ''} onClick={() => updateConfig('roof', { ...config.roof, pitch })}>{pitch}/12</button>)}
            </div>
            <Label>Siding</Label>
            <div className="choice-grid">
              {SIDING_OPTIONS.map((item) => <Choice key={item.id} selected={config.siding.type === item.id} title={item.name} subtitle={item.note} onClick={() => updateConfig('siding', { ...config.siding, type: item.id })} />)}
            </div>
            <div className="swatch-row">
              {SIDING_OPTIONS.find((x) => x.id === config.siding.type)!.swatches.map((color) => (
                <button key={color} aria-label={`Siding color ${color}`} className={`swatch ${config.siding.color === color ? 'selected' : ''}`} style={{ background: color }} onClick={() => updateConfig('siding', { ...config.siding, color })} />
              ))}
            </div>
            <Label>Trim</Label>
            <div className="trim-grid">
              {TRIM_OPTIONS.map((item) => <button key={item.id} className={config.trim.color === item.id ? 'trim-option selected' : 'trim-option'} onClick={() => updateConfig('trim', { color: item.id })}><i style={{ background: item.color }} />{item.name}</button>)}
            </div>
          </section>
        )}

        {configureTab === 'openings' && (
          <section className="control-section">
            <div className="section-heading"><span>03</span><div><h2>Openings</h2><p>Doors and windows are reflected in real time.</p></div></div>
            <Label>Garage door</Label>
            <div className="choice-grid">
              {DOOR_OPTIONS.map((item) => <Choice key={item.id} selected={config.door.style === item.id} title={item.name} subtitle={`${item.width}' × ${item.height}'`} onClick={() => updateConfig('door', { ...config.door, style: item.id, width: item.width, height: item.height })} />)}
            </div>
            <Label>Window count</Label>
            <div className="segmented">
              {[0, 2, 4, 6].map((count) => <button key={count} className={config.windows.count === count ? 'selected' : ''} onClick={() => updateConfig('windows', { ...config.windows, count: count as 0 | 2 | 4 | 6 })}>{count}</button>)}
            </div>
            <div className="notice">Windows are distributed symmetrically along both side walls for a balanced exterior.</div>
          </section>
        )}

        {configureTab === 'options' && (
          <section className="control-section">
            <div className="section-heading"><span>04</span><div><h2>Project options</h2><p>Common planning and finish upgrades.</p></div></div>
            <Toggle label="Gutters & downspouts" description="Dark-finish aluminum system." value={config.options.gutters} onChange={(value) => updateConfig('options', { ...config.options, gutters: value })} />
            <Toggle label="Attic / storage" description="Framed storage zone beneath the roof." value={config.options.attic} onChange={(value) => updateConfig('options', { ...config.options, attic: value })} />
            <Toggle label="Electrical package" description="Allowance for service, outlets and lighting." value={config.options.electrical} onChange={(value) => updateConfig('options', { ...config.options, electrical: value })} />
            <div className="notice strong">This configurator shows a planning estimate, not a construction proposal. Site conditions, permits and final selections are reviewed before pricing.</div>
          </section>
        )}
      </div>

      <div className="estimate-card">
        <div><span>Planning estimate</span><strong>{money.format(estimate.low)} – {money.format(estimate.high)}</strong></div>
        <small>{estimate.basis}.</small>
        <details className="estimate-breakdown">
          <summary>View cost breakdown</summary>
          <div className="estimate-lines">
            {estimate.items.slice(0, 8).map((item) => (
              <div key={item.name}><span>{item.name}</span><b>{money.format(item.low)}–{money.format(item.high)}</b></div>
            ))}
          </div>
        </details>
      </div>

      <div className="action-grid">
        <button className="primary" onClick={onQuote}>Request a quote</button>
        <button className="secondary" onClick={onCapture}>Save image</button>
        <button className="secondary" onClick={copyShare}>{copied ? 'Link copied' : 'Share design'}</button>
        <button className="ghost" onClick={reset}>Reset</button>
      </div>
    </aside>
  )
}

function Label({ children }: { children: ReactNode }) { return <div className="field-label">{children}</div> }
function Choice({ selected, title, subtitle, onClick }: { selected: boolean; title: string; subtitle: string; onClick: () => void }) { return <button className={`choice ${selected ? 'selected' : ''}`} onClick={onClick}><span className="choice-dot" /> <span><strong>{title}</strong><small>{subtitle}</small></span></button> }
function Toggle({ label, description, value, onChange }: { label: string; description: string; value: boolean; onChange: (v: boolean) => void }) { return <button className={`toggle ${value ? 'selected' : ''}`} onClick={() => onChange(!value)}><span><strong>{label}</strong><small>{description}</small></span><i /></button> }
function DimensionInput({ label, value, min, max, step, suffix, onChange }: { label: string; value: number; min: number; max: number; step: number; suffix: string; onChange: (v: number) => void }) { return <label className="dimension-input"><span>{label}</span><div><input type="number" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} /><em>{suffix}</em></div></label> }
