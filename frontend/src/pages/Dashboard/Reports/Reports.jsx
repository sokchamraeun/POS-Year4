import { useState, useEffect, useCallback, useMemo } from 'react'
import Sidebar from '../../../components/staff/Sidebar.jsx'
import Loader from '../../../components/shared/Loader.jsx'
import Topbar from '../../../components/staff/Topbar.jsx'
import PrinterReport from './PrinterReport.jsx'

import { API_URL, tabs, presets } from './constants/reportConstants.js'
import {
  getHeaders,
  today,
  daysAgo,
  money,
  formatDate,
  getReportName,
  getReportSubtitle,
  getRowsForExport,
  getSummaryForExport,
  buildPrintHtml,
  openPrint,
  exportExcel,
  exportCsv,
} from './utils/reportHelpers.js'

import ToolbarButton from './components/ToolbarButton.jsx'
import SalesReport from './sections/SalesReport.jsx'
import ProductsReport from './sections/ProductsReport.jsx'
import InventoryReport from './sections/InventoryReport.jsx'
import PurchasesReport from './sections/PurchasesReport.jsx'
import ProfitReport from './sections/ProfitReport.jsx'
import StaffReport from './sections/StaffReport.jsx'
import CustomersReport from './sections/CustomersReport.jsx'
import PaymentsReport from './sections/PaymentsReport.jsx'

export default function Reports() {
  const [activeTab, setActiveTab] = useState('sales')
  const [startDate, setStartDate] = useState(daysAgo(30))
  const [endDate, setEndDate] = useState(today())
  const [activePreset, setActivePreset] = useState(30)
  const [loading, setLoading] = useState({})
  const [data, setData] = useState({})

  // Sales order detail (paginated) + search/filters
  const [search, setSearch] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [salesStatus, setSalesStatus] = useState('')
  const [salesMethod, setSalesMethod] = useState('')
  const [salesPage, setSalesPage] = useState(1)
  const [salesOrders, setSalesOrders] = useState({ orders: [], pagination: {} })
  const [salesOrdersLoading, setSalesOrdersLoading] = useState(false)

  const fetchReport = useCallback(async (key, params = {}) => {
    setLoading(prev => ({ ...prev, [key]: true }))

    try {
      const queryString = new URLSearchParams(params).toString()
      const url = `${API_URL}/reports/${key}${queryString ? `?${queryString}` : ''}`

      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(),
      })

      if (!response.ok) {
        throw new Error(`Failed to load ${key} report`)
      }

      const json = await response.json()

      setData(prev => ({
        ...prev,
        [key]: json,
      }))
    } catch (error) {
      setData(prev => ({
        ...prev,
        [key]: {
          error: error.message || 'Something went wrong',
        },
      }))
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }))
    }
  }, [])

  useEffect(() => {
    const noDateTabs = ['inventory', 'printer']
    const params = noDateTabs.includes(activeTab) ? {} : { from: startDate, to: endDate }

    fetchReport(activeTab, params)
  }, [activeTab, startDate, endDate, fetchReport])

  // Debounce the search box before it hits the API.
  useEffect(() => {
    const timer = setTimeout(() => {
      setAppliedSearch(search)
      setSalesPage(1)
    }, 400)

    return () => clearTimeout(timer)
  }, [search])

  // Sales order detail: paginated, filterable, searchable.
  useEffect(() => {
    if (activeTab !== 'sales') return

    let cancelled = false
    setSalesOrdersLoading(true)

    const params = new URLSearchParams({ from: startDate, to: endDate, page: String(salesPage) })
    if (appliedSearch) params.set('search', appliedSearch)
    if (salesStatus) params.set('payment_status', salesStatus)
    if (salesMethod) params.set('payment_method', salesMethod)

    fetch(`${API_URL}/reports/orders?${params.toString()}`, { headers: getHeaders() })
      .then(response => {
        if (!response.ok) throw new Error('Failed to load orders')
        return response.json()
      })
      .then(json => {
        if (!cancelled) setSalesOrders({ orders: json.orders || [], pagination: json.pagination || {} })
      })
      .catch(() => {
        if (!cancelled) setSalesOrders({ orders: [], pagination: {} })
      })
      .finally(() => {
        if (!cancelled) setSalesOrdersLoading(false)
      })

    return () => { cancelled = true }
  }, [activeTab, startDate, endDate, appliedSearch, salesStatus, salesMethod, salesPage])

  const report = useMemo(() => data[activeTab] || {}, [data, activeTab])
  const isLoading = !!loading[activeTab]

  const exportRows = useMemo(() => {
    if (activeTab === 'sales') {
      return (salesOrders.orders || []).map(row => ({
        'Order ID': row.id,
        Date: formatDate(row.created_at),
        Customer: row.customer,
        Staff: row.staff,
        Table: row.table,
        'Payment Method': row.payment_method,
        'Payment Status': row.payment_status,
        'Order Status': row.status,
        Subtotal: money(row.subtotal),
        Discount: money(row.discount),
        Total: money(row.total),
        Cost: money(row.cost),
        Profit: money(row.profit),
      }))
    }

    return getRowsForExport(activeTab, report)
  }, [activeTab, report, salesOrders])

  const exportSummary = useMemo(() => {
    return getSummaryForExport(activeTab, report)
  }, [activeTab, report])

  function applyPreset(days) {
    setActivePreset(days)
    setStartDate(daysAgo(days))
    setEndDate(today())
  }

  function refreshReport() {
    const noDateTabs = ['inventory', 'printer']
    const params = noDateTabs.includes(activeTab) ? {} : { from: startDate, to: endDate }

    fetchReport(activeTab, params)
  }

  function handlePrint() {
    const title = `${getReportName(activeTab)} Report`
    const subtitle = getReportSubtitle(activeTab, startDate, endDate)

    openPrint(
      buildPrintHtml({
        title,
        subtitle,
        rows: exportRows,
        summary: exportSummary,
      })
    )
  }

  function handlePdf() {
    handlePrint()
  }

  function handleExcel() {
    exportExcel({
      title: `${getReportName(activeTab)} Report`,
      subtitle: getReportSubtitle(activeTab, startDate, endDate),
      rows: exportRows,
      summary: exportSummary,
    })
  }

  function handleCsv() {
    exportCsv({
      title: `${getReportName(activeTab)} Report`,
      rows: exportRows,
    })
  }

  const showDateFilter = !['inventory', 'printer'].includes(activeTab)
  const showExport = activeTab !== 'printer'

  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar />

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            <section className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 bg-gradient-to-r from-slate-950 via-slate-900 to-teal-900 px-5 py-6 sm:px-7">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-teal-200">
                      The Birdnest Cafe
                    </p>

                    <h1 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-4xl">
                      {getReportName(activeTab)} Report
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                      Review sales, products, inventory, purchases, profit, staff, customers, payments, and export reports for business records.
                    </p>
                  </div>

                  {showExport && (
                    <div className="flex flex-wrap gap-2">
                      <ToolbarButton label="Refresh" onClick={refreshReport} disabled={isLoading} />
                      <ToolbarButton label="Print" onClick={handlePrint} disabled={isLoading} />
                      <ToolbarButton label="Excel" onClick={handleExcel} disabled={isLoading} />
                      <ToolbarButton label="CSV" onClick={handleCsv} disabled={isLoading} />
                      <ToolbarButton label="PDF" onClick={handlePdf} disabled={isLoading} />
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 sm:p-5">
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {tabs.map(tab => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveTab(tab.key)}
                      className={`shrink-0 rounded-2xl border px-4 py-2.5 text-sm font-black transition-all ${
                        activeTab === tab.key
                          ? 'border-teal-600 bg-teal-600 text-white shadow-md shadow-teal-600/20'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {showDateFilter && (
                  <div className="mt-4 flex flex-col gap-4 border-t border-slate-100 pt-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex gap-2 overflow-x-auto">
                      {presets.map(preset => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => applyPreset(preset.days)}
                          className={`shrink-0 rounded-xl border px-4 py-2 text-xs font-black transition-colors ${
                            activePreset === preset.days
                              ? 'border-slate-900 bg-slate-900 text-white'
                              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <label className="text-xs font-black text-slate-500">From</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={event => {
                          setActivePreset(null)
                          setStartDate(event.target.value)
                        }}
                        className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                      />

                      <label className="text-xs font-black text-slate-500">To</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={event => {
                          setActivePreset(null)
                          setEndDate(event.target.value)
                        }}
                        className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'sales' && (
                  <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 lg:flex-row lg:items-center">
                    <input
                      type="text"
                      value={search}
                      onChange={event => setSearch(event.target.value)}
                      placeholder="Search order #, customer name or phone..."
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 lg:max-w-xs"
                    />

                    <select
                      value={salesStatus}
                      onChange={event => { setSalesStatus(event.target.value); setSalesPage(1) }}
                      className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-teal-500"
                    >
                      <option value="">All Status</option>
                      <option value="Paid">Paid</option>
                      <option value="Unpaid">Unpaid</option>
                      <option value="Refunded">Refunded</option>
                    </select>

                    <select
                      value={salesMethod}
                      onChange={event => { setSalesMethod(event.target.value); setSalesPage(1) }}
                      className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-teal-500"
                    >
                      <option value="">All Methods</option>
                      <option value="Cash">Cash</option>
                      <option value="KHQR">KHQR</option>
                      <option value="Card">Card</option>
                    </select>
                  </div>
                )}
              </div>
            </section>

            {isLoading ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-12 shadow-sm">
                <Loader page={false} text="Loading report..." />
              </div>
            ) : report.error ? (
              <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
                <p className="text-lg font-black text-red-700">Report Error</p>
                <p className="mt-1 text-sm text-red-600">{report.error}</p>
              </div>
            ) : (
              <>
                {activeTab === 'sales' && (
                  <SalesReport
                    data={report}
                    orders={salesOrders.orders}
                    pagination={salesOrders.pagination}
                    ordersLoading={salesOrdersLoading}
                    page={salesPage}
                    onPageChange={setSalesPage}
                  />
                )}
                {activeTab === 'products' && <ProductsReport data={report} />}
                {activeTab === 'inventory' && <InventoryReport data={report} />}
                {activeTab === 'purchases' && <PurchasesReport data={report} />}
                {activeTab === 'profit' && <ProfitReport data={report} />}
                {activeTab === 'staff' && <StaffReport data={report} />}
                {activeTab === 'customers' && <CustomersReport data={report} />}
                {activeTab === 'payments' && <PaymentsReport data={report} />}
                {activeTab === 'printer' && <PrinterReport />}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
