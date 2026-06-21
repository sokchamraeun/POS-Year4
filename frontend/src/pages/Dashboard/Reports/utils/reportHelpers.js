import { tabs } from '../constants/reportConstants.js'

export function getHeaders() {
  return {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
    Accept: 'application/json',
  }
}

export function localDateInput(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function today() {
  return localDateInput(new Date())
}

export function daysAgo(days) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return localDateInput(date)
}

export function money(value) {
  return '$' + Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function percent(value) {
  return Number(value || 0).toFixed(1) + '%'
}

export function formatDate(value) {
  if (!value) return '—'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function safeText(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

export function fileName(value) {
  return String(value || 'report')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function downloadFile(name, content, type) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = name

  document.body.appendChild(link)
  link.click()
  link.remove()

  URL.revokeObjectURL(url)
}

export function getReportName(activeTab) {
  return tabs.find(tab => tab.key === activeTab)?.label || 'Report'
}

export function getReportSubtitle(activeTab, startDate, endDate) {
  if (activeTab === 'inventory') return 'Current ingredient stock status'
  if (activeTab === 'printer') return 'Printer report'
  return `${startDate} to ${endDate}`
}

export function getRowsForExport(activeTab, report) {
  if (!report || report.error) return []

  switch (activeTab) {
    case 'sales':
      return (report.daily || []).map(row => ({
        Date: row.date,
        Orders: row.orders,
        Revenue: money(row.revenue),
      }))

    case 'products':
      return (Array.isArray(report) ? report : []).map(row => ({
        Product: row.product?.name || 'Unknown',
        Size: row.size?.name || '—',
        'Qty Sold': row.total_qty ?? 0,
        Revenue: money(row.revenue),
      }))

    case 'inventory':
      return (report.ingredients || []).map(row => ({
        Ingredient: row.name,
        Unit: row.unit,
        'Stock Left': Number(row.stock_quantity || 0).toFixed(2),
        'Reorder Level': Number(row.reorder_level || 0).toFixed(2),
        Status: row.status || '—',
        Transactions: row.transactions_count ?? 0,
      }))

    case 'purchases':
      return (report.transactions || []).map(row => ({
        Date: formatDate(row.created_at),
        Ingredient: row.ingredient?.name || '—',
        Quantity: Number(row.quantity || 0).toFixed(2),
        Note: row.note || '—',
      }))

    case 'profit':
      return (report.monthly || []).map(row => ({
        Month: row.month,
        Revenue: money(row.revenue),
        Cost: money(row.cost),
        Discount: money(row.discount),
        Profit: money(row.profit),
      }))

    case 'staff': {
      const staffRows = report.staff || report.users || report.data || []
      return (Array.isArray(staffRows) ? staffRows : []).map(row => ({
        Staff: row.name || row.user?.name || 'Unknown',
        Role: row.role || '—',
        Orders: row.orders_count ?? row.total_orders ?? 0,
        Revenue: money(row.revenue || row.total_sales || 0),
        'Discount Given': money(row.total_discount || 0),
        'Refund Orders': row.refund_orders ?? 0,
      }))
    }

    case 'customers':
      return (report.customers || []).map(row => ({
        Customer: row.name || 'Guest',
        Phone: row.phone || '—',
        Orders: row.orders_count ?? 0,
        'Total Spent': money(row.total_spent),
        Points: row.points ?? 0,
        Registered: row.created_at ? formatDate(row.created_at) : '—',
      }))

    case 'payments':
      return [
        ...(report.by_method || []).map(row => ({
          Type: 'Payment Method',
          Name: row.payment_method || 'Unknown',
          Orders: row.count ?? 0,
          Revenue: money(row.revenue),
        })),
        ...(report.by_status || []).map(row => ({
          Type: 'Payment Status',
          Name: row.payment_status || 'Unknown',
          Orders: row.count ?? 0,
          Revenue: money(row.amount),
        })),
      ]

    default:
      return []
  }
}

export function getSummaryForExport(activeTab, report) {
  if (!report || report.error) return []

  switch (activeTab) {
    case 'sales':
      return [
        ['Total Sales', money(report.total_sales)],
        ['Total Orders', report.total_orders ?? 0],
        ['Total Profit', money(report.total_profit)],
        ['Total Cost', money(report.total_cost)],
        ['Total Discount', money(report.total_discount)],
        ['Paid Amount', money(report.paid_amount)],
        ['Unpaid Amount', money(report.unpaid_amount)],
        ['Refund Amount', money(report.refund_amount)],
        ['Average Order Value', money(report.avg_order_value)],
      ]

    case 'products': {
      const rows = Array.isArray(report) ? report : []
      const qty = rows.reduce((sum, row) => sum + Number(row.total_qty || 0), 0)
      const revenue = rows.reduce((sum, row) => sum + Number(row.revenue || 0), 0)

      return [
        ['Product Rows', rows.length],
        ['Quantity Sold', qty],
        ['Revenue', money(revenue)],
      ]
    }

    case 'inventory':
      return [
        ['Total Ingredients', report.total_ingredients ?? 0],
        ['Low Stock Items', report.low_stock_count ?? 0],
        ['In Stock', (report.total_ingredients ?? 0) - (report.low_stock_count ?? 0)],
      ]

    case 'purchases':
      return [
        ['Total Purchases', report.summary?.total_transactions ?? 0],
        ['Total Quantity', Number(report.summary?.total_quantity || 0).toFixed(2)],
      ]

    case 'profit':
      return [
        ['Total Revenue', money(report.revenue)],
        ['Total Cost', money(report.cost)],
        ['Gross Profit', money(report.gross_profit)],
        ['Net Profit', money(report.net_profit)],
        ['Profit Margin', percent(report.margin)],
        ['Total Discount', money(report.discount)],
        ['Refund', money(report.refund)],
      ]

    case 'staff': {
      const staffRows = report.staff || []
      const revenue = staffRows.reduce((sum, row) => sum + Number(row.revenue || 0), 0)
      const orders = staffRows.reduce((sum, row) => sum + Number(row.orders_count || 0), 0)

      return [
        ['Staff Members', staffRows.length],
        ['Total Orders', orders],
        ['Total Sales', money(revenue)],
      ]
    }

    case 'customers':
      return [
        ['Total Customers', report.total_customers ?? 0],
        ['New Customers', report.new_customers ?? 0],
      ]

    case 'payments': {
      const revenue = (report.by_method || []).reduce((sum, row) => sum + Number(row.revenue || 0), 0)
      const orders = (report.by_status || []).reduce((sum, row) => sum + Number(row.count || 0), 0)

      return [
        ['Total Revenue', money(revenue)],
        ['Total Orders', orders],
        ['Paid Amount', money(report.paid_amount)],
        ['Unpaid Amount', money(report.unpaid_amount)],
        ['Refund Amount', money(report.refund_amount)],
      ]
    }

    default:
      return []
  }
}

export function buildPrintHtml({ title, subtitle, rows, summary }) {
  const tableRows = rows.length ? rows : [{ Message: 'No data available' }]
  const columns = Object.keys(tableRows[0])
  const generatedAt = new Date().toLocaleString()

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${safeText(title)}</title>
        <style>
          * {
            box-sizing: border-box;
          }

          body {
            font-family: Arial, sans-serif;
            color: #111827;
            background: #ffffff;
            padding: 28px;
          }

          .header {
            display: flex;
            justify-content: space-between;
            gap: 24px;
            padding-bottom: 18px;
            border-bottom: 2px solid #0f766e;
            margin-bottom: 22px;
          }

          h1 {
            margin: 0;
            font-size: 26px;
            color: #0f172a;
          }

          .subtitle {
            margin-top: 6px;
            color: #64748b;
            font-size: 13px;
          }

          .shop {
            text-align: right;
            color: #475569;
            font-size: 13px;
            line-height: 1.5;
          }

          .summary {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin-bottom: 22px;
          }

          .summary-card {
            border: 1px solid #dbe4e8;
            border-radius: 12px;
            padding: 13px;
            background: #f8fafc;
          }

          .summary-label {
            font-size: 12px;
            color: #64748b;
            margin-bottom: 5px;
          }

          .summary-value {
            font-size: 18px;
            font-weight: 700;
            color: #0f172a;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
          }

          th {
            text-align: left;
            padding: 10px;
            background: #0f766e;
            color: #ffffff;
            border: 1px solid #0f766e;
          }

          td {
            padding: 9px 10px;
            border: 1px solid #e2e8f0;
          }

          tr:nth-child(even) td {
            background: #f8fafc;
          }

          .footer {
            margin-top: 24px;
            padding-top: 12px;
            border-top: 1px solid #e2e8f0;
            font-size: 11px;
            color: #64748b;
            text-align: center;
          }

          @media print {
            body {
              padding: 0;
            }

            .summary {
              grid-template-columns: repeat(2, 1fr);
            }
          }
        </style>
      </head>

      <body>
        <div class="header">
          <div>
            <h1>${safeText(title)}</h1>
            <div class="subtitle">${safeText(subtitle)}</div>
          </div>

          <div class="shop">
            <strong>The Birdnest Cafe</strong><br />
            POS Cafe Report<br />
            Generated: ${safeText(generatedAt)}
          </div>
        </div>

        ${
          summary.length
            ? `<div class="summary">
                ${summary.map(([label, value]) => `
                  <div class="summary-card">
                    <div class="summary-label">${safeText(label)}</div>
                    <div class="summary-value">${safeText(value)}</div>
                  </div>
                `).join('')}
              </div>`
            : ''
        }

        <table>
          <thead>
            <tr>
              ${columns.map(col => `<th>${safeText(col)}</th>`).join('')}
            </tr>
          </thead>

          <tbody>
            ${tableRows.map(row => `
              <tr>
                ${columns.map(col => `<td>${safeText(row[col])}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          This report was generated by POS Cafe System.
        </div>

        <script>
          window.onload = function () {
            window.focus();
            window.print();
          };
        </script>
      </body>
    </html>
  `
}

export function openPrint(html) {
  const win = window.open('', '_blank')

  if (!win) {
    alert('Please allow popup window for print/export.')
    return
  }

  win.document.open()
  win.document.write(html)
  win.document.close()
}

export function printOrderReceipt(order) {
  const line = (label, value) => `
    <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px;">
      <span style="color:#64748b;">${safeText(label)}</span>
      <span style="font-weight:700;color:#0f172a;">${safeText(value)}</span>
    </div>`

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Invoice #${safeText(order.id)}</title>
        <style>
          body { font-family: Arial, sans-serif; color:#111827; padding:24px; max-width:360px; margin:0 auto; }
          h1 { text-align:center; font-size:20px; margin:0; }
          .sub { text-align:center; color:#64748b; font-size:12px; margin:4px 0 16px; }
          hr { border:none; border-top:1px dashed #cbd5e1; margin:12px 0; }
          .total { font-size:16px; }
        </style>
      </head>
      <body>
        <h1>The Birdnest Cafe</h1>
        <div class="sub">Invoice / Receipt</div>
        <hr />
        ${line('Order ID', '#' + order.id)}
        ${line('Date', formatDate(order.created_at))}
        ${line('Customer', order.customer)}
        ${line('Staff', order.staff)}
        ${line('Table', order.table)}
        ${line('Payment Method', order.payment_method)}
        ${line('Payment Status', order.payment_status)}
        ${line('Order Status', order.status)}
        <hr />
        ${line('Subtotal', money(order.subtotal))}
        ${line('Discount', money(order.discount))}
        <hr />
        <div class="total">${line('Total', money(order.total))}</div>
        <hr />
        <div class="sub">Thank you for visiting The Birdnest Cafe</div>
        <script>window.onload = function(){ window.focus(); window.print(); };</script>
      </body>
    </html>`

  openPrint(html)
}

export function exportExcel({ title, subtitle, rows, summary }) {
  const tableRows = rows.length ? rows : [{ Message: 'No data available' }]
  const columns = Object.keys(tableRows[0])

  const html = `
    <html>
      <head>
        <meta charset="UTF-8" />
      </head>
      <body>
        <h2>${safeText(title)}</h2>
        <p>${safeText(subtitle)}</p>

        ${
          summary.length
            ? `<table border="1">
                <tbody>
                  ${summary.map(([label, value]) => `
                    <tr>
                      <td><strong>${safeText(label)}</strong></td>
                      <td>${safeText(value)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              <br />`
            : ''
        }

        <table border="1">
          <thead>
            <tr>
              ${columns.map(col => `<th>${safeText(col)}</th>`).join('')}
            </tr>
          </thead>

          <tbody>
            ${tableRows.map(row => `
              <tr>
                ${columns.map(col => `<td>${safeText(row[col])}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `

  downloadFile(
    `${fileName(title)}.xls`,
    html,
    'application/vnd.ms-excel;charset=utf-8'
  )
}

export function exportCsv({ title, rows }) {
  const tableRows = rows.length ? rows : [{ Message: 'No data available' }]
  const columns = Object.keys(tableRows[0])

  const csv = [
    columns.join(','),
    ...tableRows.map(row =>
      columns.map(col => `"${String(row[col] ?? '').replaceAll('"', '""')}"`).join(',')
    ),
  ].join('\n')

  downloadFile(`${fileName(title)}.csv`, csv, 'text/csv;charset=utf-8')
}
