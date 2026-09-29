import { useEffect, useState } from 'react'
import { ConfiguratorPanel } from './ConfiguratorPanel'
import { OutdoorScene } from '../scene/OutdoorScene'
import { SceneToolbar } from './SceneToolbar'
import { QuoteModal } from './QuoteModal'
import { loadConfigFromUrl } from '../lib/share'
import { useGarageStore } from '../state/useGarageStore'
import './styles.css'

export function App() {
    const setConfig = useGarageStore((s) => s.setConfig)
    const [captureToken, setCaptureToken] = useState(0)
    const [quoteOpen, setQuoteOpen] = useState(false)
    const [mobilePanel, setMobilePanel] = useState(false)

    useEffect(() => {
        const fromUrl = loadConfigFromUrl()
        if (fromUrl) setConfig(fromUrl)
    }, [setConfig])

    return (
        <main className="app-shell">
            <div className={`scene-stage ${mobilePanel ? 'mobile-panel-open' : ''}`}>
                <OutdoorScene captureToken={captureToken} />

                <SceneToolbar />

                <div className="scene-badge">
                    <span className="live-dot" />
                    3D CONFIGURATOR <small>LIVE</small>
                </div>

                <div className="scene-hint">
                    Drag to rotate · Wheel to zoom · Configure on the left
                </div>

                <button
                    className="mobile-config-button"
                    onClick={() => setMobilePanel((v) => !v)}
                >
                    {mobilePanel
                        ? 'Close configurator'
                        : 'Configure garage'}
                </button>
            </div>

            <div className={`config-wrap ${mobilePanel ? 'open' : ''}`}>
                <ConfiguratorPanel
                    onCapture={() => setCaptureToken((v) => v + 1)}
                    onQuote={() => setQuoteOpen(true)}
                />
            </div>

            <QuoteModal
                open={quoteOpen}
                onClose={() => setQuoteOpen(false)}
            />
        </main>
    )
}