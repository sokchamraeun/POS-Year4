import { useState, useEffect, useCallback, useMemo } from 'react'
import Sidebar from '../../../components/staff/Sidebar.jsx'
import Loader from '../../../components/shared/Loader.jsx'
import Topbar from '../../../components/staff/Topbar.jsx'

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

  const [search, setSearch] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [salesStatus, setSalesStatus] = useState('')
  const [salesMethod, setSalesMethod] = useState('')
  const [saleUser, setSaleUser] = useState('all')
  const [saleUsers, setSaleUsers] = useState([])
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
    const noDateTabs = ['inventory']
    const params = noDateTabs.includes(activeTab)
      ? {}
      : { from: startDate, to: endDate, ...(activeTab === 'sales' && saleUser !== 'all' ? { sale_user: saleUser } : {}) }

    fetchReport(activeTab, params)
  }, [activeTab, startDate, endDate, saleUser, fetchReport])

  useEffect(() => {
    fetch(`${API_URL}/reports/sale-users`, {
      headers: getHeaders(),
    })
      .then(res => res.ok ? res.json() : [])
      .then(data => setSaleUsers(data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setAppliedSearch(search)
      setSalesPage(1)
    }, 400)

    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    if (activeTab !== 'sales') return

    let cancelled = false
    setSalesOrdersLoading(true)

    const params = new URLSearchParams({
      from: startDate,
      to: endDate,
      page: String(salesPage),
    })

    if (appliedSearch) params.set('search', appliedSearch)
    if (salesStatus) params.set('payment_status', salesStatus)
    if (salesMethod) params.set('payment_method', salesMethod)
    if (saleUser !== 'all') params.set('staff_id', saleUser)

    fetch(`${API_URL}/reports/orders?${params.toString()}`, {
      headers: getHeaders(),
    })
      .then(response => {
        if (!response.ok) throw new Error('Failed to load orders')
        return response.json()
      })
      .then(json => {
        if (!cancelled) {
          setSalesOrders({
            orders: json.orders || [],
            pagination: json.pagination || {},
          })
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSalesOrders({
            orders: [],
            pagination: {},
          })
        }
      })
      .finally(() => {
        if (!cancelled) {
          setSalesOrdersLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [activeTab, startDate, endDate, appliedSearch, salesStatus, salesMethod, saleUser, salesPage])

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
    const noDateTabs = ['inventory']
    const params = noDateTabs.includes(activeTab) ? {} : { from: startDate, to: endDate }

    fetchReport(activeTab, params)
  }

  function handlePrint() {
    openPrint(
      buildPrintHtml({
        title: `${getReportName(activeTab)} Report`,
        subtitle: getReportSubtitle(activeTab, startDate, endDate),
        rows: exportRows,
        summary: exportSummary,
        saleUserLabel: saleUser === 'all' ? 'All Users' : (saleUsers.find(u => u.id === Number(saleUser))?.name || 'Selected User'),
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

  const showDateFilter = activeTab !== 'inventory'
  const showExport = true

  const tabIcons = {
    sales: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m3-9.5A3.5 3.5 0 008.5 10c0 2 1.5 2.75 3.5 3.25 2 .5 3.5 1.25 3.5 3.25A3.5 3.5 0 019 18.5" />
      </svg>
    ),
    products: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4 8 4 8-4zM4 7v10l8 4 8-4V7M12 11v10" />
      </svg>
    ),
    inventory: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M6 7l1 13h10l1-13M9 11h6M10 15h4M8 7V4h8v3" />
      </svg>
    ),
    purchases: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M6 7l1.2 12h9.6L18 7M9 11h6M10 15h4" />
      </svg>
    ),
    profit: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 17l6-6 4 4 6-8M14 7h6v6" />
      </svg>
    ),
    staff: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11a4 4 0 10-8 0M5 20a7 7 0 0114 0" />
      </svg>
    ),
    customers: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11a4 4 0 10-8 0M5 20a7 7 0 0114 0M19 8v4M21 10h-4" />
      </svg>
    ),
    payments: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8h18M5 6h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2zM7 15h4" />
      </svg>
    ),
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar />

        <main className="isolate flex-1 overflow-y-auto">
          <div className="w-full p-3 sm:p-5 lg:p-6 xl:p-8">
            <section className="mb-6 w-full overflow-hidden rounded-[2rem] border border-slate-200/60 bg-white shadow-sm ring-1 ring-slate-900/5">
              <div className="relative overflow-hidden bg-slate-900 px-5 py-7 sm:px-8 sm:py-10">
                <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-teal-500/20 blur-3xl" />
                <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />

                <div className="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/20 text-teal-300 backdrop-blur-sm">
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                      </div>

                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-300">
                        The Birdnest Cafe
                      </p>
                    </div>

                    <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
                      {getReportName(activeTab)} Overview
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm text-slate-400">
                      Comprehensive insights into your business performance. Filter,
                      analyze, print, and export your data in real-time.
                    </p>
                  </div>

                  {showExport && (
                    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-700/50 bg-slate-800/50 p-2 backdrop-blur-md">
                      <ToolbarButton
                        label="Refresh"
                        onClick={refreshReport}
                        disabled={isLoading}
                      />

                      <div className="mx-1 hidden h-6 w-px bg-slate-700 sm:block" />

                      <ToolbarButton
                        label="Print"
                        onClick={handlePrint}
                        disabled={isLoading}
                      />
                      <ToolbarButton
                        label="Excel"
                        onClick={handleExcel}
                        disabled={isLoading}
                      />
                      <ToolbarButton
                        label="CSV"
                        onClick={handleCsv}
                        disabled={isLoading}
                      />
                      <ToolbarButton
                        label="PDF"
                        onClick={handlePdf}
                        disabled={isLoading}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="px-4 py-5 sm:px-6 lg:px-8">
<div className="overflow-x-auto pb-2">
  <div className="flex w-max min-w-full items-center gap-1 rounded-3xl border border-slate-200 bg-slate-100 p-1.5 shadow-inner">
    {tabs.map(tab => {
      const isActive = activeTab === tab.key

      return (
        <button
          key={tab.key}
          type="button"
          onClick={() => setActiveTab(tab.key)}
          className={`
            group relative flex shrink-0 items-center gap-2 rounded-2xl px-4 py-3 text-sm font-black
            transition-all duration-300 outline-none
            focus-visible:ring-4 focus-visible:ring-teal-500/20
            ${
              isActive
                ? 'bg-white text-slate-950 shadow-lg shadow-slate-900/10 ring-1 ring-slate-200'
                : 'text-slate-500 hover:bg-white/70 hover:text-slate-900'
            }
          `}
        >
          <span
            className={`
              flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-300
              ${
                isActive
                  ? 'bg-slate-900 text-teal-300 shadow-md shadow-slate-900/20'
                  : 'bg-white text-slate-400 ring-1 ring-slate-200 group-hover:text-teal-600'
              }
            `}
          >
            {tabIcons[tab.key]}
          </span>

          <span>{tab.label}</span>

          {isActive && (
            <span className="absolute bottom-1.5 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-teal-500" />
          )}
        </button>
      )
    })}
  </div>
</div>
                {showDateFilter && (
                  <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-5 p-4 xl:flex-row xl:items-center xl:justify-between">
                      <div>
                        <div className="mb-3 flex items-center gap-2">
                          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-teal-600 text-white">
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2.4}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M8 7V3m8 4V3M4 11h16M5 5h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z"
                              />
                            </svg>
                          </div>

                          <div>
                            <p className="text-sm font-black text-slate-900">
                              Quick Select
                            </p>
                            <p className="text-xs font-semibold text-slate-400">
                              Choose report date range
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {presets.map(preset => {
                            const isActive = activePreset === preset.days

                            return (
                              <button
                                key={preset.label}
                                type="button"
                                onClick={() => applyPreset(preset.days)}
                                className={`
                                  rounded-2xl px-4 py-2 text-xs font-black transition-all duration-300
                                  ${
                                    isActive
                                      ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20'
                                      : 'border border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-white hover:text-slate-950'
                                  }
                                `}
                              >
                                {preset.label}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-1.5">
                          <label className="mb-1 block px-2 text-[11px] font-black uppercase tracking-wider text-slate-400">
                            From
                          </label>

                          <input
                            type="date"
                            value={startDate}
                            onChange={event => {
                              setActivePreset(null)
                              setStartDate(event.target.value)
                            }}
                            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition-all focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 sm:w-[150px]"
                          />
                        </div>

                        <div className="hidden h-px w-6 bg-slate-300 sm:block" />

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-1.5">
                          <label className="mb-1 block px-2 text-[11px] font-black uppercase tracking-wider text-slate-400">
                            To
                          </label>

                          <input
                            type="date"
                            value={endDate}
                            onChange={event => {
                              setActivePreset(null)
                              setEndDate(event.target.value)
                            }}
                            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition-all focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 sm:w-[150px]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'sales' && (
                  <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center">
                    <div className="relative flex-1">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <svg
                          className="h-5 w-5 text-slate-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                      </div>

                      <input
                        type="text"
                        value={search}
                        onChange={event => setSearch(event.target.value)}
                        placeholder="Search order #, customer, or phone..."
                        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                      />
                    </div>

                    <select
                      value={salesStatus}
                      onChange={event => {
                        setSalesStatus(event.target.value)
                        setSalesPage(1)
                      }}
                      className="h-11 cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none transition-all hover:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                    >
                      <option value="">All Statuses</option>
                      <option value="Paid">Paid</option>
                      <option value="Unpaid">Unpaid</option>
                      <option value="Refunded">Refunded</option>
                    </select>

                    <select
                      value={salesMethod}
                      onChange={event => {
                        setSalesMethod(event.target.value)
                        setSalesPage(1)
                      }}
                      className="h-11 cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none transition-all hover:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                    >
                      <option value="">All Methods</option>
                      <option value="Cash">Cash</option>
                      <option value="KHQR">KHQR</option>
                      <option value="Card">Card</option>
                    </select>

                    <select
                      value={saleUser}
                      onChange={event => {
                        setSaleUser(event.target.value)
                        setSalesPage(1)
                      }}
                      className="h-11 cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none transition-all hover:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                    >
                      <option value="all">All Sale Users</option>

                      {saleUsers.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </section>

            <section className="w-full">
              {isLoading ? (
                <div className="flex min-h-[520px] flex-col items-center justify-center rounded-[2rem] border border-dashed border-slate-200 bg-white/70 p-16 shadow-sm backdrop-blur-sm">
                  <Loader page={false} text="Crunching the numbers..." />
                </div>
              ) : report.error ? (
                <div className="flex min-h-[520px] flex-col items-center justify-center rounded-[2rem] border border-red-200 bg-red-50 p-12 text-center shadow-sm">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <svg
                      className="h-6 w-6 text-red-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>

                  <h3 className="text-lg font-black text-red-800">
                    Unable to load report
                  </h3>

                  <p className="mx-auto mt-2 max-w-sm text-sm text-red-600">
                    {report.error}
                  </p>

                  <button
                    type="button"
                    onClick={refreshReport}
                    className="mt-6 text-sm font-bold text-red-700 underline underline-offset-4 hover:text-red-800"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <div className="min-h-[calc(100vh-330px)] w-full overflow-x-auto rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
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
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}