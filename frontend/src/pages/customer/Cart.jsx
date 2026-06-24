import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Navbar from '../../components/customer/Navbar.jsx'
import MobileBottomNav from '../../components/customer/MobileBottomNav.jsx'
import CartItem from '../../components/customer/CartItem.jsx'
import ProductModal from '../../components/customer/ProductModal.jsx'
import { useCart } from '../../context/CartContext.jsx'
import { useCustomerAuth } from '../../context/CustomerAuthContext.jsx'
import { calcFinalPrice, getPromotionLabel, resolvePromotionForSize } from '../../utils/promotion.js'

const API_URL = import.meta.env.VITE_API_URL

export default function Cart() {
  const navigate = useNavigate()

  const {
    items,
    updateItem,
    clearCart,
    totalItems,
    fullTotal,
    discountTotal,
    totalPrice,
  } = useCart()

  const { customer, isLoggedIn } = useCustomerAuth()

  const [searchParams] = useSearchParams()
  const qrToken = (() => {
    const fromUrl = searchParams.get('token')
    if (fromUrl) {
      sessionStorage.setItem('qr_token', fromUrl)
      return fromUrl
    }
    return sessionStorage.getItem('qr_token') || ''
  })()

  const [orderNote, setOrderNote] = useState('')
  const [name, setName] = useState(customer?.name || '')
  const [phone, setPhone] = useState(customer?.phone || '')
  const [selectedTable, setSelectedTable] = useState('')
  const [tables, setTables] = useState([])
  const [paymentMethod, setPaymentMethod] = useState('pay_later')
  const [placing, setPlacing] = useState(false)
  const [done, setDone] = useState(false)

  // Edit item modal state
  const [editItem, setEditItem] = useState(null)
  const [editSize, setEditSize] = useState('')
  const [editSugar, setEditSugar] = useState('')
  const [editIce, setEditIce] = useState('')
  const [editSugarNote, setEditSugarNote] = useState('')
  const [editIceNote, setEditIceNote] = useState('')
  const [editAddOn, setEditAddOn] = useState('')
  const [editQty, setEditQty] = useState(1)

  function openEditItem(item) {
    setEditItem(item)
    setEditSize(item.size || item.sizes?.[0]?.name || '')
    setEditSugar(item.sugar || item.sugar_levels?.[0]?.name || '')
    setEditIce(item.ice || item.ice_levels?.[0]?.name || '')
    setEditSugarNote(item.sugarNote || '')
    setEditIceNote(item.iceNote || '')
    setEditAddOn(item.addOn || '')
    setEditQty(item.qty || 1)
  }

  function closeEditItem() {
    setEditItem(null)
  }

  // Derived edit pricing
  const editBasePrice = (sizeName) => {
    const s = editItem?.sizes?.find((x) => x.name === sizeName)
    return s ? Number(s.pivot?.price ?? 0) : 0
  }
  const editAddOnPrice = (addOnName) => {
    if (!addOnName) return 0
    const addon = editItem?.addons?.find((a) => a.name === addOnName)
    if (!addon) return 0
    const size = editItem?.sizes?.find((s) => s.name === editSize)
    const sp = addon.size_prices?.find((x) => x.size_id === size?.id)
    return sp ? Number(sp.price) : Number(addon.price) || 0
  }

  const editSizeObj = editItem?.sizes?.find((s) => s.name === editSize)
  const editPromotion = editItem?.promotion
    ? resolvePromotionForSize(editItem.promotion, editSizeObj?.id)
    : editItem?.promotion
  const editPrice = editBasePrice(editSize) + editAddOnPrice(editAddOn)
  const editFinalPrice =
    editPromotion?.type === 'buy_x_get_y'
      ? editPrice
      : calcFinalPrice(editPrice, editPromotion)
  const editHasDiscount = editPromotion
    ? editFinalPrice < editPrice || editPromotion.type === 'buy_x_get_y'
    : false
  const editIceObj = editItem?.ice_levels?.find((i) => i.name === editIce)
  const editSugarObj = editItem?.sugar_levels?.find((s) => s.name === editSugar)

  function handleSaveEdit() {
    if (!editItem) return
    updateItem(editItem.key, {
      size: editSize,
      sugar: editSugar,
      ice: editIce,
      sugarNote: editSugarObj?.requires_input ? editSugarNote.trim() : '',
      iceNote: editIceObj?.requires_input ? editIceNote.trim() : '',
      addOn: editAddOn,
      unitPrice: editPrice,
      promotion: editPromotion,
      qty: editQty,
    })
    closeEditItem()
  }

  const subtotal = Number(fullTotal || 0)
  const discount = Number(discountTotal || 0)
  const finalTotal = Number(totalPrice || 0)

  // QR table orders don't require a name/phone — the table identifies the order.
  const canPlaceOrder = items.length > 0 && !placing && (isLoggedIn || qrToken || phone.trim())

  useEffect(() => {
    if (customer?.name) setName(customer.name)
    if (customer?.phone) setPhone(customer.phone)
  }, [customer])

  useEffect(() => {
    if (qrToken) return

    fetch(`${API_URL}/tables/available`)
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : []
        setTables(list)
      })
      .catch(() => setTables([]))
  }, [qrToken])

  useEffect(() => {
    if (!done) return

    const timer = setTimeout(() => {
      navigate('/products')
    }, 3000)

    return () => clearTimeout(timer)
  }, [done])

  async function placeOrder() {
    if (!canPlaceOrder) return

    setPlacing(true)

    try {
      let customerId = customer?.id || null

      if (!customerId && phone.trim()) {
        const cleanPhone = phone.trim()

        const custRes = await fetch(
          `${API_URL}/customers?phone=${encodeURIComponent(cleanPhone)}`,
          {
            headers: {
              Accept: 'application/json',
            },
          }
        )

        const custData = await custRes.json()
        const customerList = Array.isArray(custData.data) ? custData.data : []
        const existing = customerList.find((c) => c.phone === cleanPhone)

        if (existing) {
          customerId = existing.id
        } else {
          const createRes = await fetch(`${API_URL}/customers`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({
              phone: cleanPhone,
              name: name.trim() || cleanPhone,
            }),
          })

          if (createRes.ok) {
            const created = await createRes.json()
            customerId = created.id ?? created.data?.id ?? null
          }
        }
      }

      const orderItems = items.map((c) => {
        const sizeId = c.sizes?.find((s) => s.name === c.size)?.id ?? null

        const sugarId =
          (c.sugar_levels || c.sugarLevels)?.find((s) => s.name === c.sugar)?.id ??
          null

        const iceId =
          (c.ice_levels || c.iceLevels)?.find((i) => i.name === c.ice)?.id ?? null

        const addonObj = c.addons?.find((a) => a.name === c.addOn)

        return {
          product_id: c.id,
          size_id: sizeId,
          sugar_level_id: sugarId,
          sugar_note: c.sugarNote || null,
          ice_level_id: iceId,
          ice_note: c.iceNote || null,
          qty: c.qty,
          unit_price: c.unitPrice,
          subtotal: c.unitPrice * c.qty,
          addons: addonObj ? [{ addon_id: addonObj.id, price: 0 }] : [],
          promotion_snapshot: c.promotion ?? null,
        }
      })

      const pm =
        paymentMethod === 'khqr'
          ? 'KHQR'
          : paymentMethod === 'cash'
            ? 'Cash'
            : null

      const res = qrToken
        ? await fetch(`${API_URL}/tables/${qrToken}/order-items`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({ customer_id: customerId, items: orderItems, discount }),
          })
        : await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({
              customer_id: customerId,
              table_id: selectedTable || null,
              total: finalTotal,
              discount,
              status: 'New',
              payment_method: pm,
              payment_status: paymentMethod === 'cash' ? 'Paid' : 'Unpaid',
              note: orderNote.trim() || null,
              items: orderItems,
            }),
          })

      if (!res.ok) {
        const err = await res.json()
        alert(err.message || 'Failed to place order')
        setPlacing(false)
        return
      }

      const createdOrder = await res.json()
      const dbOrderId = createdOrder.id ?? createdOrder.data?.id ?? null

      clearCart()

      if (paymentMethod === 'khqr' && dbOrderId) {
        const initRes = await fetch(`${API_URL}/orders/payment/initiate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            order_id: dbOrderId,
          }),
        })

        const initData = await initRes.json()

        if (initData.checkout_url) {
          window.location.href = initData.checkout_url
          return
        }

        alert(initData.message || 'KHQR payment initiation failed')
        setPlacing(false)
        return
      }

      setDone(true)
      setPlacing(false)
    } catch (err) {
      setPlacing(false)
      alert('Error: ' + (err.message || 'Check connection.'))
    }
  }

  const promotionLabels = items
    .map((item) =>
      item.promotion &&
      item.promotion.type !== 'combo_discount' &&
      item.promotion.type !== 'combo'
        ? getPromotionLabel(item.promotion)
        : ''
    )
    .filter(Boolean)

  if (done) {
    return (
      <div className="min-h-screen bg-[#f0fdfa] pb-24 text-[#134e4a] sm:pb-0">
        <Navbar />

        <main className="flex min-h-[calc(100vh-76px)] items-center justify-center px-4">
          <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-[#ccfbf1] bg-white p-7 text-center shadow-[0_28px_80px_rgba(15,118,110,0.16)]">
            <div className="pointer-events-none absolute -right-14 -top-14 h-36 w-36 rounded-full bg-emerald-300/25 blur-3xl" />

            <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-emerald-100 text-emerald-600 shadow-inner">
              <svg
                className="h-11 w-11"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.4}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <h1 className="text-2xl font-black text-[#134e4a]">ការបញ្ជាទិញបានជោគជ័យ!</h1>

            <p className="mt-2 text-sm font-semibold leading-6 text-[#0d9488]">
              ការបញ្ជាទិញរបស់អ្នកត្រូវបានដាក់ជូនដោយជោគជ័យ។ យើងនឹងរៀបចំវាឆាប់ៗនេះ។
            </p>

            <button
              type="button"
              onClick={() => navigate('/products')}
              className="mt-6 w-full rounded-2xl bg-gradient-to-r from-[#134e4a] via-[#0f766e] to-[#0d9488] px-6 py-3 text-sm font-black text-white shadow-[0_16px_35px_rgba(15,118,110,0.30)] transition-all duration-300 hover:-translate-y-0.5"
            >
              បន្តការដើរទិញ
            </button>
          </div>
        </main>

        <MobileBottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f0fdfa] pb-24 text-[#134e4a] sm:pb-0">
      <Navbar />

      <main className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.22),transparent_34%),radial-gradient(circle_at_top_right,rgba(15,118,110,0.14),transparent_32%)]" />
        <div className="pointer-events-none absolute -left-24 top-24 h-64 w-64 rounded-full bg-teal-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-72 h-72 w-72 rounded-full bg-[#0f766e]/15 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {items.length === 0 ? (
            <EmptyCart onBrowse={() => navigate('/products')} />
          ) : (
            <div className="rounded-[1rem] border border-[#99f6e4] bg-white/45 p-3 shadow-[0_24px_70px_rgba(15,118,110,0.12)] backdrop-blur-xl sm:p-5">
              <div className="mb-5 flex flex-col gap-2 border-b border-[#ccfbf1] pb-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#14b8a6]">
                    ត្រួតពិនិត្យការបញ្ជាទិញ
                  </p>
                  <h1 className="mt-1 text-2xl font-black text-[#134e4a] sm:text-3xl">
                    ពិនិត្យការបញ្ជាទិញរបស់អ្នក
                  </h1>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[#ccfbf1] px-4 py-2 text-xs font-black text-[#0d9488]">
                    {totalItems} មុខ
                  </span>
                  <span className="rounded-full bg-[#134e4a] px-4 py-2 text-xs font-black text-white">
                    ${finalTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-[1fr_420px] lg:items-start">
                {/* Left */}
                <section className="space-y-4">
                  <div>
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-black text-[#134e4a]">
                          មុខម្ហូបដែលបានជ្រើសរើស
                        </h2>

                        <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-[#14b8a6]">
                          {totalItems} មុខក្នុងកន្ត្រករបស់អ្នក
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={clearCart}
                        className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-black text-red-600 transition-all hover:bg-red-100"
                      >
                        លុបទាំងអស់
                      </button>
                    </div>

                    <div className="space-y-3">
                      {items.map((item) => (
                        <CartItem
                          key={item.key}
                          item={item}
                          onEditItem={openEditItem}
                        />
                      ))}
                    </div>
                  </div>

                  <Panel title="កំណត់ចំណាំ" subtitle="សារបន្ថែមសម្រាប់បុគ្គលិក">
                    <textarea
                      placeholder="ឧទាហរណ៍: ផ្អែមតិច រៀបចំក្រោយ១០នាទី..."
                      value={orderNote}
                      onChange={(e) => setOrderNote(e.target.value)}
                      className="min-h-[96px] w-full resize-none rounded-2xl border border-[#99f6e4] bg-[#f0fdfa] p-4 text-sm font-semibold text-[#134e4a] outline-none transition-all placeholder:text-[#5eead4] focus:border-[#0d9488] focus:bg-white focus:ring-4 focus:ring-[#14b8a6]/20"
                      rows={3}
                    />
                  </Panel>
                </section>

                {/* Right */}
                <aside className="space-y-4 lg:sticky lg:top-[96px]">
                  <Panel title="ព័ត៌មានអតិថិជន" subtitle="សម្រាប់ប្រវត្តិការបញ្ជាទិញ និងទំនាក់ទំនង">
                    {isLoggedIn ? (
                      <div className="flex items-center gap-3 rounded-2xl border border-[#99f6e4] bg-[#f0fdfa] p-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#134e4a] to-[#0d9488] text-sm font-black text-white shadow-md">
                          {(customer?.name?.[0] || 'U').toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-[#134e4a]">
                            {customer?.name}
                          </p>
                          <p className="truncate text-xs font-bold text-[#0d9488]">
                            {customer?.phone}
                          </p>
                        </div>
                      </div>
                    ) : qrToken ? (
                      <div className="rounded-2xl border border-[#99f6e4] bg-[#f0fdfa] p-4 text-sm font-bold text-[#0d9488]">
                        ការបញ្ជាទិញតាមតុ — មិនត្រូវការឈ្មោះ ឬលេខទូរស័ព្ទទេ។
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Field
                          label="ឈ្មោះរបស់អ្នក"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="បញ្ចូលឈ្មោះរបស់អ្នក"
                        />

                        <Field
                          label="លេខទូរស័ព្ទ"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="បញ្ចូលលេខទូរស័ព្ទ"
                          required
                        />
                      </div>
                    )}

                    {!qrToken && (
                      <div className="mt-3">
                        <label className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-[#14b8a6]">
                          តុ
                        </label>

                        <select
                          value={selectedTable}
                          onChange={(e) => setSelectedTable(e.target.value)}
                          className="w-full rounded-2xl border border-[#99f6e4] bg-[#f0fdfa] px-4 py-3 text-sm font-black text-[#134e4a] outline-none transition-all focus:border-[#0d9488] focus:bg-white focus:ring-4 focus:ring-[#14b8a6]/20"
                        >
                          <option value="">គ្មានតុ</option>
                          {tables.map((table) => (
                            <option key={table.id} value={table.id}>
                              {table.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </Panel>

                  <Panel title="វិធីបង់ប្រាក់" subtitle="ជ្រើសរើសវិធីបង់ប្រាក់ដែលអ្នកចង់ប្រើ">
                    <div className="grid grid-cols-3 gap-2">
                      <PaymentButton
                        active={paymentMethod === 'pay_later'}
                        label="បង់ក្រោយ"
                        sub="មិនទាន់បង់"
                        onClick={() => setPaymentMethod('pay_later')}
                      />

                      <PaymentButton
                        active={paymentMethod === 'cash'}
                        label="សាច់ប្រាក់"
                        sub="បង់រួច"
                        onClick={() => setPaymentMethod('cash')}
                      />

                      <PaymentButton
                        active={paymentMethod === 'khqr'}
                        label="KHQR"
                        sub="ស្កេន"
                        onClick={() => setPaymentMethod('khqr')}
                      />
                    </div>
                  </Panel>

                  <Panel title="សង្ខេបការបញ្ជាទិញ" subtitle="ពិនិត្យតម្លៃសរុបមុនពេលដាក់បញ្ជា">
                    <div className="space-y-3">
                      <SummaryRow label="តម្លៃសរុប" value={`$${subtotal.toFixed(2)}`} />
                      <SummaryRow label="ចំនួនមុខ" value={`${totalItems}`} />

                      {discount > 0 && (
                        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-black text-emerald-700">
                              បញ្ចុះតម្លៃ
                            </span>
                            <span className="font-black text-emerald-700">
                              -${discount.toFixed(2)}
                            </span>
                          </div>

                          {promotionLabels.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {promotionLabels.map((label, index) => (
                                <span
                                  key={`${label}-${index}`}
                                  className="rounded-full bg-white px-2 py-1 text-[10px] font-black text-emerald-700"
                                >
                                  {label}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="border-t border-[#ccfbf1] pt-3">
                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#14b8a6]">
                              សរុប
                            </p>
                            <p className="text-xs font-semibold text-[#0d9488]">
                              រួមទាំងបញ្ចុះតម្លៃ
                            </p>
                          </div>

                          <p className="text-3xl font-black text-[#0f766e]">
                            ${finalTotal.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {!isLoggedIn && !qrToken && !phone.trim() && (
                        <p className="rounded-2xl bg-teal-50 px-3 py-2 text-xs font-bold text-teal-700">
                          សូមបញ្ចូលលេខទូរស័ព្ទមុនពេលដាក់ការបញ្ជាទិញ។
                        </p>
                      )}

                      <button
                        type="button"
                        onClick={placeOrder}
                        disabled={!canPlaceOrder}
                        className="w-full rounded-2xl bg-gradient-to-r from-[#134e4a] via-[#0f766e] to-[#0d9488] py-4 text-sm font-black text-white shadow-[0_18px_40px_rgba(15,118,110,0.30)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_50px_rgba(15,118,110,0.40)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0"
                      >
                        {placing ? 'កំពុងដំណើរការ...' : 'ដាក់ការបញ្ជាទិញ'}
                      </button>
                    </div>
                  </Panel>
                </aside>
              </div>
            </div>
          )}
        </div>
      </main>

      <MobileBottomNav />

      {editItem && (
        <ProductModal
          product={editItem}
          show={!!editItem}
          onClose={closeEditItem}
          selectedSize={editSize}
          selectedSugar={editSugar}
          selectedIce={editIce}
          selectedAddOn={editAddOn}
          sugarNote={editSugarNote}
          iceNote={editIceNote}
          qty={editQty}
          price={editPrice}
          finalPrice={editFinalPrice}
          hasDiscount={editHasDiscount}
          stockMsg=""
          onSizeChange={setEditSize}
          onSugarChange={setEditSugar}
          onIceChange={setEditIce}
          onAddOnChange={setEditAddOn}
          onSugarNoteChange={setEditSugarNote}
          onIceNoteChange={setEditIceNote}
          onQtyChange={setEditQty}
          onAddToCart={handleSaveEdit}
          submitLabel="ធ្វើបច្ចុប្បន្នភាព"
        />
      )}
    </div>
  )
}

function Panel({ title, subtitle, action, children }) {
  return (
    <div className="rounded-[1rem] border border-[#ccfbf1] bg-white/85 p-4 shadow-[0_20px_55px_rgba(15,118,110,0.08)] backdrop-blur-xl sm:p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-[#134e4a]">{title}</h2>

          {subtitle && (
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-[#14b8a6]">
              {subtitle}
            </p>
          )}
        </div>

        {action}
      </div>

      {children}
    </div>
  )
}

function Field({ label, type = 'text', required = false, ...props }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-[#14b8a6]">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <input
        type={type}
        className="w-full rounded-2xl border border-[#99f6e4] bg-[#f0fdfa] px-4 py-3 text-sm font-semibold text-[#134e4a] outline-none transition-all placeholder:text-[#5eead4] focus:border-[#0d9488] focus:bg-white focus:ring-4 focus:ring-[#14b8a6]/20"
        {...props}
      />
    </div>
  )
}

function PaymentButton({ active, label, sub, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-3 text-center transition-all duration-300 active:scale-95 ${
        active
          ? 'border-[#0f766e] bg-[#134e4a] text-white shadow-[0_14px_30px_rgba(15,118,110,0.25)]'
          : 'border-[#99f6e4] bg-[#f0fdfa] text-[#115e59] hover:bg-[#ccfbf1] hover:text-[#134e4a]'
      }`}
    >
      <p className="text-sm font-black">{label}</p>

      <p
        className={`mt-0.5 text-[10px] font-black uppercase tracking-[0.12em] ${
          active ? 'text-[#99f6e4]' : 'text-[#14b8a6]'
        }`}
      >
        {sub}
      </p>
    </button>
  )
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="font-bold text-[#0d9488]">{label}</span>
      <span className="font-black text-[#134e4a]">{value}</span>
    </div>
  )
}

function EmptyCart({ onBrowse }) {
  return (
    <div className="mx-auto max-w-lg rounded-[2rem] border border-[#ccfbf1] bg-white/85 px-5 py-16 text-center shadow-[0_20px_55px_rgba(15,118,110,0.08)] backdrop-blur-xl">
      <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-[#ccfbf1] text-[#0d9488] shadow-inner">
        <svg
          className="h-11 w-11"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M3 3h2l1 5h13l1-5h2M6 8l1.5 9h9L18 8M9 21a1 1 0 100-2 1 1 0 000 2zm6 0a1 1 0 100-2 1 1 0 000 2z"
          />
        </svg>
      </div>

      <h2 className="text-2xl font-black text-[#134e4a]">កន្ត្រករបស់អ្នកទទេ</h2>

      <p className="mx-auto mt-2 max-w-sm text-sm font-semibold leading-6 text-[#0d9488]">
        សូមបន្ថែមកាហ្វេ ឬភេសជ្ជៈដែលអ្នកចូលចិត្តមុនពេលទិញ។
      </p>

      <button
        type="button"
        onClick={onBrowse}
        className="mt-6 rounded-2xl bg-gradient-to-r from-[#134e4a] via-[#0f766e] to-[#0d9488] px-6 py-3 text-sm font-black text-white shadow-[0_16px_35px_rgba(15,118,110,0.30)] transition-all duration-300 hover:-translate-y-0.5"
      >
        មើលមុខម្ហូប
      </button>
    </div>
  )
}