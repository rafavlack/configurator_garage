import { jsPDF } from 'jspdf'
import type { GarageConfig } from '../types/garage'

type Customer = {
    name: string
    email: string
    phone: string
    city: string
    notes: string
}

type Estimate = {
    low: number
    high: number
}

type GenerateQuotePdfParams = {
    leadId: string
    customer: Customer
    config: GarageConfig
    estimate: Estimate
    designUrl: string
}

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

function safeFileName(value: string): string {
    return value
        .trim()
        .replace(/[^a-zA-Z0-9-_ ]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50)
}

function addSectionTitle(
    pdf: jsPDF,
    title: string,
    y: number
) {
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(11)
    pdf.text(title, 20, y)

    pdf.setDrawColor(210, 210, 210)
    pdf.line(20, y + 3, 190, y + 3)

    return y + 12
}

function addRow(
    pdf: jsPDF,
    label: string,
    value: string,
    y: number
) {
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(9)
    pdf.text(label, 20, y)

    pdf.setFont('helvetica', 'normal')
    pdf.text(value, 75, y)

    return y + 6
}

function ensurePage(
    pdf: jsPDF,
    y: number
): number {
    if (y > 270) {
        pdf.addPage()

        return 20
    }

    return y
}

export async function generateQuotePdf({
                                           leadId,
                                           customer,
                                           config,
                                           estimate,
                                           designUrl,
                                       }: GenerateQuotePdfParams) {
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'letter',
    })

    /*
     * Save the same Lead ID used by the PDF so QuoteModal
     * can use exactly the same ID in the email.
     */
    sessionStorage.setItem(
        'tgb_last_lead_id',
        leadId
    )

    const now = new Date()

    const generatedDate =
        now.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })

    const generatedTime =
        now.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
        })

    let y = 20

    /*
     * HEADER
     */
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(20)
    pdf.text(
        'THE GARAGE BUILDERS',
        20,
        y
    )

    y += 9

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)
    pdf.text(
        'Garage Design Request',
        20,
        y
    )

    y += 9

    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(9)
    pdf.text(
        `Project ID: ${leadId}`,
        20,
        y
    )

    y += 5

    pdf.setFont('helvetica', 'normal')
    pdf.text(
        `Generated: ${generatedDate} at ${generatedTime}`,
        20,
        y
    )

    y += 12

    /*
     * CUSTOMER
     */
    y = addSectionTitle(
        pdf,
        'CUSTOMER',
        y
    )

    y = addRow(
        pdf,
        'Name',
        customer.name,
        y
    )

    y = addRow(
        pdf,
        'Email',
        customer.email,
        y
    )

    y = addRow(
        pdf,
        'Phone',
        customer.phone || 'Not provided',
        y
    )

    y = addRow(
        pdf,
        'City',
        customer.city || 'Not provided',
        y
    )

    y += 7
    y = ensurePage(pdf, y)

    /*
     * DIMENSIONS
     */
    y = addSectionTitle(
        pdf,
        'GARAGE DIMENSIONS',
        y
    )

    y = addRow(
        pdf,
        'Width',
        `${config.dimensions.width}'`,
        y
    )

    y = addRow(
        pdf,
        'Depth',
        `${config.dimensions.depth}'`,
        y
    )

    y = addRow(
        pdf,
        'Wall Height',
        `${config.dimensions.wallHeight}'`,
        y
    )

    y += 7
    y = ensurePage(pdf, y)

    /*
     * ROOF
     */
    y = addSectionTitle(
        pdf,
        'ROOF',
        y
    )

    y = addRow(
        pdf,
        'Type',
        humanize(config.roof.type),
        y
    )

    y = addRow(
        pdf,
        'Pitch',
        `${config.roof.pitch}/12`,
        y
    )

    y = addRow(
        pdf,
        'Material',
        humanize(config.roof.material),
        y
    )

    y += 7
    y = ensurePage(pdf, y)

    /*
     * EXTERIOR
     */
    y = addSectionTitle(
        pdf,
        'EXTERIOR',
        y
    )

    y = addRow(
        pdf,
        'Siding',
        humanize(config.siding.type),
        y
    )

    y = addRow(
        pdf,
        'Siding Color',
        config.siding.color,
        y
    )

    y = addRow(
        pdf,
        'Trim Color',
        humanize(config.trim.color),
        y
    )

    y += 7
    y = ensurePage(pdf, y)

    /*
     * GARAGE DOOR
     */
    y = addSectionTitle(
        pdf,
        'GARAGE DOOR',
        y
    )

    y = addRow(
        pdf,
        'Style',
        humanize(config.door.style),
        y
    )

    y = addRow(
        pdf,
        'Width',
        `${config.door.width}'`,
        y
    )

    y = addRow(
        pdf,
        'Height',
        `${config.door.height}'`,
        y
    )

    y = addRow(
        pdf,
        'Color',
        config.door.color,
        y
    )

    y += 7
    y = ensurePage(pdf, y)

    /*
     * WINDOWS
     */
    y = addSectionTitle(
        pdf,
        'WINDOWS',
        y
    )

    y = addRow(
        pdf,
        'Quantity',
        String(config.windows.count),
        y
    )

    y = addRow(
        pdf,
        'Frame Color',
        config.windows.frameColor,
        y
    )

    y += 7
    y = ensurePage(pdf, y)

    /*
     * FOUNDATION
     */
    y = addSectionTitle(
        pdf,
        'FOUNDATION',
        y
    )

    y = addRow(
        pdf,
        'Type',
        humanize(config.foundation),
        y
    )

    y += 7
    y = ensurePage(pdf, y)

    /*
     * OPTIONS
     */
    y = addSectionTitle(
        pdf,
        'OPTIONS',
        y
    )

    y = addRow(
        pdf,
        'Gutters',
        yesNo(config.options.gutters),
        y
    )

    y = addRow(
        pdf,
        'Attic',
        yesNo(config.options.attic),
        y
    )

    y = addRow(
        pdf,
        'Electrical',
        yesNo(config.options.electrical),
        y
    )

    y += 7
    y = ensurePage(pdf, y)

    /*
     * ESTIMATE
     */
    y = addSectionTitle(
        pdf,
        'ESTIMATED RANGE',
        y
    )

    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(16)

    pdf.text(
        `$${estimate.low.toLocaleString()} - $${estimate.high.toLocaleString()}`,
        20,
        y
    )

    y += 13

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(8)

    const estimateNote =
        'Planning estimate only. Final construction pricing may vary based on site conditions, permits, engineering, material selections and final scope.'

    const estimateLines =
        pdf.splitTextToSize(
            estimateNote,
            170
        )

    pdf.text(
        estimateLines,
        20,
        y
    )

    y +=
        estimateLines.length * 4 +
        9

    y = ensurePage(pdf, y)

    /*
     * NOTES
     */
    y = addSectionTitle(
        pdf,
        'CUSTOMER NOTES',
        y
    )

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)

    const notes =
        customer.notes?.trim() ||
        'None'

    const noteLines =
        pdf.splitTextToSize(
            notes,
            170
        )

    pdf.text(
        noteLines,
        20,
        y
    )

    y +=
        noteLines.length * 4 +
        12

    y = ensurePage(pdf, y)

    /*
     * DESIGN LINK
     */
    y = addSectionTitle(
        pdf,
        'DESIGN LINK',
        y
    )

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(7)

    const urlLines =
        pdf.splitTextToSize(
            designUrl,
            170
        )

    pdf.text(
        urlLines,
        20,
        y
    )

    y +=
        urlLines.length * 3.5 +
        12

    y = ensurePage(pdf, y)

    /*
     * CONFIGURATION REFERENCE
     *
     * We intentionally include a compact configuration
     * reference so the PDF remains useful even without
     * opening the design link.
     */
    y = addSectionTitle(
        pdf,
        'CONFIGURATION REFERENCE',
        y
    )

    pdf.setFont('courier', 'normal')
    pdf.setFontSize(6.5)

    const configText = JSON.stringify(
        config,
        null,
        2
    )

    const configLines =
        pdf.splitTextToSize(
            configText,
            168
        )

    for (const line of configLines) {
        y = ensurePage(pdf, y)

        pdf.text(
            line,
            20,
            y
        )

        y += 3
    }

    /*
     * FOOTER ON ALL PAGES
     */
    const pageCount =
        pdf.getNumberOfPages()

    for (
        let page = 1;
        page <= pageCount;
        page++
    ) {
        pdf.setPage(page)

        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(7)

        pdf.setTextColor(
            130,
            130,
            130
        )

        pdf.text(
            `The Garage Builders — ${leadId}`,
            20,
            285
        )

        pdf.text(
            `Page ${page} of ${pageCount}`,
            175,
            285,
            {
                align: 'right',
            }
        )

        pdf.setTextColor(
            0,
            0,
            0
        )
    }

    const customerName =
        safeFileName(
            customer.name || 'Customer'
        )

    const filename =
        `TGB-Garage-Design-${customerName}-${leadId}.pdf`

    pdf.save(filename)
}