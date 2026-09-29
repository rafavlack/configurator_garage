import { useMemo, useState, type FormEvent } from 'react'
import { estimateGarage } from '../lib/pricing'
import { makeShareUrl } from '../lib/share'
import { generateQuotePdf } from '../lib/generateQuotePdf'
import { useGarageStore } from '../state/useGarageStore'

const QUOTE_EMAIL = 'bidrequests11@gmail.com'

function humanize(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return 'Not specified'
  }

  return String(value)
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[_-]+/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase())
}

function yesNo(value: boolean): string {
  return value ? 'Yes' : 'No'
}

function createLeadId(): string {
  const now = new Date()

  const date =
      `${now.getFullYear()}` +
      `${String(now.getMonth() + 1).padStart(2, '0')}` +
      `${String(now.getDate()).padStart(2, '0')}`

  const time =
      `${String(now.getHours()).padStart(2, '0')}` +
      `${String(now.getMinutes()).padStart(2, '0')}` +
      `${String(now.getSeconds()).padStart(2, '0')}`

  const random = Math.random()
      .toString(36)
      .substring(2, 7)
      .toUpperCase()

  return `TGB-${date}-${time}-${random}`
}

export function QuoteModal({
                             open,
                             onClose,
                           }: {
  open: boolean
  onClose: () => void
}) {
  const config = useGarageStore((s) => s.config)

  const estimate = useMemo(
      () => estimateGarage(config),
      [config]
  )

  const [submitted, setSubmitted] = useState(false)
  const [pdfReady, setPdfReady] = useState(false)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    notes: '',
  })

  if (!open) return null

  /*
   * IMPORTANT:
   *
   * When running locally, makeShareUrl() automatically creates
   * a production URL using:
   *
   * https://www.thegaragebuilders.net
   *
   * When deployed, it uses the current production origin.
   */
  const designUrl = makeShareUrl(config)

  const updateForm = (
      field: keyof typeof form,
      value: string
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  /*
   * The email body intentionally contains only a human-readable
   * summary and the public design URL.
   *
   * The complete project specification is contained in the PDF.
   */
  const emailBody = `GARAGE DESIGN REQUEST
The Garage Builders
====================

PROJECT ID:
${'PROJECT_ID_PLACEHOLDER'}

CUSTOMER
Name: ${form.name}
Email: ${form.email}
Phone: ${form.phone || 'Not provided'}
City: ${form.city || 'Not provided'}

GARAGE
Dimensions: ${config.dimensions.width}' x ${config.dimensions.depth}'
Wall Height: ${config.dimensions.wallHeight}'

Roof: ${humanize(config.roof.type)}
Roof Pitch: ${config.roof.pitch}/12
Roof Material: ${humanize(config.roof.material)}

Siding: ${humanize(config.siding.type)}
Siding Color: ${config.siding.color}

Trim Color: ${humanize(config.trim.color)}

Garage Door: ${humanize(config.door.style)}
Door Size: ${config.door.width}' x ${config.door.height}'

Windows: ${config.windows.count}

Foundation: ${humanize(config.foundation)}

OPTIONS
Gutters: ${yesNo(config.options.gutters)}
Attic: ${yesNo(config.options.attic)}
Electrical: ${yesNo(config.options.electrical)}

ESTIMATED RANGE
$${estimate.low.toLocaleString()} - $${estimate.high.toLocaleString()}

DESIGN LINK
${designUrl}

IMPORTANT
The attached TGB garage design PDF contains the complete
project specification and customer information.

CUSTOMER NOTES
${form.notes || 'None'}
`

  /*
   * The actual mailto is generated after a real Project ID
   * has been created.
   */
  const createMailto = (leadId: string) => {
    const body = emailBody.replace(
        'PROJECT_ID_PLACEHOLDER',
        leadId
    )

    return `mailto:${QUOTE_EMAIL}?subject=${encodeURIComponent(
        `Garage Design Request — ${leadId}`
    )}&body=${encodeURIComponent(body)}`
  }

  const submit = async (
      e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault()

    setError('')
    setGeneratingPdf(true)

    try {
      const leadId = createLeadId()

      /*
       * Generate the PDF before showing the success state.
       *
       * The PDF contains the complete project information.
       */
      await generateQuotePdf({
        leadId,
        customer: form,
        config,
        estimate,
        designUrl,
      })

      setPdfReady(true)
      setSubmitted(true)
    } catch (err) {
      console.error('Unable to generate quote PDF:', err)

      setError(
          'The project PDF could not be generated. Please try again.'
      )
    } finally {
      setGeneratingPdf(false)
    }
  }

  const leadIdForDisplay = (() => {
    /*
     * The visible lead ID is extracted from the generated
     * email link only when needed. A new ID is not generated
     * here because that would produce different IDs.
     */
    return null
  })()

  return (
      <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={onClose}
      >
        <div
            className="quote-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="quote-modal-title"
            onMouseDown={(e) => e.stopPropagation()}
        >
          {!submitted ? (
              <>
                <div className="modal-head">
                  <div>
                    <span>REQUEST A QUOTE</span>

                    <h2 id="quote-modal-title">
                      Take this design to the next step.
                    </h2>
                  </div>

                  <button
                      type="button"
                      onClick={onClose}
                      aria-label="Close"
                  >
                    ×
                  </button>
                </div>

                <p className="modal-copy">
                  Your current design, dimensions, options and
                  planning estimate will be included in a
                  professional project PDF.
                </p>

                <form onSubmit={submit}>
                  <div className="form-grid">
                    <Field
                        label="Name"
                        required
                        value={form.name}
                        onChange={(v) =>
                            updateForm('name', v)
                        }
                    />

                    <Field
                        label="Email"
                        required
                        type="email"
                        value={form.email}
                        onChange={(v) =>
                            updateForm('email', v)
                        }
                    />

                    <Field
                        label="Phone"
                        value={form.phone}
                        onChange={(v) =>
                            updateForm('phone', v)
                        }
                    />

                    <Field
                        label="City"
                        value={form.city}
                        onChange={(v) =>
                            updateForm('city', v)
                        }
                    />
                  </div>

                  <label className="field-textarea">
                    <span>Notes</span>

                    <textarea
                        rows={4}
                        value={form.notes}
                        onChange={(e) =>
                            updateForm(
                                'notes',
                                e.target.value
                            )
                        }
                        placeholder="Tell us about site conditions, timeline, vehicle count or other priorities."
                    />
                  </label>

                  <div className="modal-summary">
                    <div>
                      <span>Current estimate</span>

                      <strong>
                        ${estimate.low.toLocaleString()} – $
                        {estimate.high.toLocaleString()}
                      </strong>
                    </div>

                    <div>
                      <span>Project document</span>

                      <small>
                        A PDF with the complete design
                        specification will be generated.
                      </small>
                    </div>
                  </div>

                  {error && (
                      <div className="quote-error">
                        {error}
                      </div>
                  )}

                  <button
                      className="primary full"
                      type="submit"
                      disabled={generatingPdf}
                  >
                    {generatingPdf
                        ? 'Generating project PDF...'
                        : 'Prepare request'}
                  </button>
                </form>
              </>
          ) : (
              <div className="success-state">
                <div className="success-icon">
                  ✓
                </div>

                <span>
              DESIGN CAPTURED
            </span>

                <h2>
                  Your project PDF is ready.
                </h2>

                <p>
                  The project specification has been
                  generated as a PDF. Attach the downloaded
                  PDF to the email before sending it to
                  The Garage Builders.
                </p>

                {pdfReady && (
                    <div className="pdf-ready-notice">
                      <strong>
                        PDF generated successfully
                      </strong>

                      <span>
                  Look for the downloaded TGB project
                  PDF in your Downloads folder.
                </span>
                    </div>
                )}

                <a
                    className="primary full"
                    href={createMailto(
                        /*
                         * The PDF generator creates and stores the
                         * current ID in sessionStorage so that the
                         * same ID can be used here.
                         */
                        sessionStorage.getItem(
                            'tgb_last_lead_id'
                        ) || 'TGB-PROJECT'
                    )}
                >
                  Open email
                </a>

                <button
                    type="button"
                    className="secondary full"
                    onClick={onClose}
                >
                  Close
                </button>
              </div>
          )}
        </div>
      </div>
  )
}

function Field({
                 label,
                 required,
                 type = 'text',
                 value,
                 onChange,
               }: {
  label: string
  required?: boolean
  type?: string
  value: string
  onChange: (v: string) => void
}) {
  return (
      <label className="field">
      <span>
        {label}
        {required ? ' *' : ''}
      </span>

        <input
            required={required}
            type={type}
            value={value}
            onChange={(e) =>
                onChange(e.target.value)
            }
        />
      </label>
  )
}