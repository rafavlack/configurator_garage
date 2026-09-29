import { useGarageStore } from '../state/useGarageStore'

export function SceneToolbar() {
  const view = useGarageStore((s) => s.view)
  const setView = useGarageStore((s) => s.setView)
  return (
    <div className="scene-toolbar">
      <div className="view-label">VIEW</div>
      {[
        ['hero', 'Perspective'],
        ['front', 'Front'],
        ['side', 'Side'],
        ['back', 'Back'],
        ['top', 'Top'],
      ].map(([id, label]) => <button key={id} className={view === id ? 'active' : ''} onClick={() => setView(id as typeof view)}>{label}</button>)}
    </div>
  )
}
