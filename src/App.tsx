import { useTemplateStore } from './stores/templateStore'
import { Button } from './components/ui/button'
import { useState } from 'react'
import { FindingTemplate, ActionTemplate, SharedTemplate } from './types/templates'
function App() {
  const { 
    activeFinding,
    activeAction,
    findingValues,
    actionValues,
    errors,
    setActiveFinding,
    setActiveAction,
    updateFindingValues,
    updateActionValues,
    getAvailableActions,
    generateText,
    getTemplatesByType
  } = useTemplateStore()

  const [preview, setPreview] = useState<string>('')

  const findings = getTemplatesByType('finding') as FindingTemplate[]
  const availableActions = getAvailableActions()

  const handleFindingSelect = (template: FindingTemplate) => {
    setActiveFinding(template)
    setActiveAction(null)
    setPreview('')
  }

  const handleActionSelect = (template: ActionTemplate) => {
    setActiveAction(template)
    setPreview('')
  }

  const handleFindingValueChange = (key: string, value: any) => {
    updateFindingValues({ ...findingValues, [key]: value })
  }

  const handleActionValueChange = (key: string, value: any) => {
    updateActionValues({ ...actionValues, [key]: value })
  }

  const handleGeneratePreview = () => {
    setPreview(generateText())
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Template Editor</h1>
      
      {/* Finding Templates */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Findings</h2>
        <div className="flex gap-2">
          {findings.map(template => (
            <Button
              key={template.id}
              variant={activeFinding?.id === template.id ? 'default' : 'outline'}
              onClick={() => handleFindingSelect(template)}
            >
              {template.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Finding Variables */}
      {activeFinding && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Finding Variables</h2>
          <div className="space-y-4">
            {Object.entries(activeFinding.variables).map(([key, config]) => (
              <div key={key} className="flex flex-col gap-1">
                <label className="text-sm font-medium">
                  {key}{config.required && '*'}:
                </label>
                {config.type === 'enum' ? (
                  <select
                    className="border rounded p-1"
                    value={findingValues[key] || ''}
                    onChange={(e) => handleFindingValueChange(key, e.target.value)}
                  >
                    <option value="">Select...</option>
                    {config.useShared ? (
                      // Get options from shared template
                      (Array.from(useTemplateStore.getState().templates.values())
                        .find(t => 
                          t.type === 'shared' && 
                          t.category === config.useShared?.type
                        ) as SharedTemplate | undefined)?.options.map(opt => (
                          <option key={opt.id} value={opt.id}>
                            {opt.name}
                          </option>
                        ))
                    ) : (
                      // Use direct options
                      config.options?.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))
                    )}
                  </select>
                ) : config.type === 'boolean' ? (
                  <input
                    type="checkbox"
                    checked={findingValues[key] || false}
                    onChange={(e) => handleFindingValueChange(key, e.target.checked)}
                  />
                ) : config.type === 'number' ? (
                  <input
                    type="number"
                    className="border rounded p-1"
                    value={findingValues[key] || ''}
                    onChange={(e) => handleFindingValueChange(key, e.target.value)}
                    min={config.validation?.min}
                    max={config.validation?.max}
                  />
                ) : (
                  <input
                    type="text"
                    className="border rounded p-1"
                    value={findingValues[key] || ''}
                    onChange={(e) => handleFindingValueChange(key, e.target.value)}
                  />
                )}
                {errors[key] && (
                  <span className="text-sm text-red-500">{errors[key]}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Actions */}
      {activeFinding && availableActions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Available Actions</h2>
          <div className="flex gap-2">
            {availableActions.map(template => (
              <Button
                key={template.id}
                variant={activeAction?.id === template.id ? 'default' : 'outline'}
                onClick={() => handleActionSelect(template)}
              >
                {template.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Action Variables */}
      {activeAction && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Action Variables</h2>
          <div className="space-y-4">
            {Object.entries(activeAction.variables).map(([key, config]) => (
              <div key={key} className="flex flex-col gap-1">
                <label className="text-sm font-medium">
                  {key}{config.required && '*'}:
                </label>
                {config.type === 'enum' ? (
                  <select
                    className="border rounded p-1"
                    value={actionValues[key] || ''}
                    onChange={(e) => handleActionValueChange(key, e.target.value)}
                  >
                    <option value="">Select...</option>
                    {config.useShared ? (
                      // Get options from shared template
                      (Array.from(useTemplateStore.getState().templates.values())
                        .find(t => 
                          t.type === 'shared' && 
                          t.category === config.useShared?.type
                        ) as SharedTemplate | undefined)?.options.map(opt => (
                          <option key={opt.id} value={opt.id}>
                            {opt.name}
                          </option>
                        ))
                    ) : (
                      // Use direct options
                      config.options?.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))
                    )}
                  </select>
                ) : config.type === 'boolean' ? (
                  <input
                    type="checkbox"
                    checked={actionValues[key] || false}
                    onChange={(e) => handleActionValueChange(key, e.target.checked)}
                  />
                ) : (
                  <input
                    type="text"
                    className="border rounded p-1"
                    value={actionValues[key] || ''}
                    onChange={(e) => handleActionValueChange(key, e.target.value)}
                  />
                )}
                {errors[key] && (
                  <span className="text-sm text-red-500">{errors[key]}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generate Preview Button */}
      {(activeFinding || activeAction) && (
        <Button 
          className="mb-4"
          onClick={handleGeneratePreview}
        >
          Generate Preview
        </Button>
      )}

      {/* Preview */}
      {preview && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Preview</h2>
          <div className="p-4 border rounded bg-gray-50 whitespace-pre-line">
            {preview}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
