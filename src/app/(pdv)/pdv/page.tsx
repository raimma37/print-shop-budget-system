"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { formatCurrency } from "@/lib/utils";
import { Search, ShoppingCart, User as UserIcon, X, CreditCard, Banknote, QrCode, ArrowRight, Plus, Minus, Trash2, Home } from "lucide-react";
import Link from "next/link";

type Product = { id: number; name: string; basePrice: string; category: string; size: string; packagings?: any[] };
type Client = { id: number; name: string; cpfCnpj: string };
type CartItem = { product: Product; name: string; packagingId: number | null; conversionFactor: number; quantity: number; unitPrice: number; discount: number };

export default function PdvPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  
  // Payment States
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("dinheiro");
  const [amountPaid, setAmountPaid] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receiptSale, setReceiptSale] = useState<any>(null);
  
  const [packagingSelectModalOpen, setPackagingSelectModalOpen] = useState(false);
  const [packagingSelectProduct, setPackagingSelectProduct] = useState<Product | null>(null);
  
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [clientSearch, setClientSearch] = useState("");
  const clientSearchRef = useRef<HTMLInputElement>(null);
  const [globalDiscountValue, setGlobalDiscountValue] = useState("");
  const [globalDiscountPercent, setGlobalDiscountPercent] = useState("");
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const paymentInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Carrega o catálogo (Fase 1: online)
    fetch("/api/pdv/catalog")
      .then(res => res.json())
      .then(data => {
        setProducts(data.products || []);
        setClients(data.clients || []);
      })
      .catch(err => console.error("Erro ao carregar catálogo", err));

    // Focar no campo de busca ao iniciar
    if (searchInputRef.current) searchInputRef.current.focus();
  }, []);

  // Atalhos de Teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (paymentModalOpen || clientModalOpen) {
        if (paymentModalOpen) {
          if (e.key === "F1") { e.preventDefault(); setPaymentMethod("dinheiro"); }
          else if (e.key === "F2") { e.preventDefault(); setPaymentMethod("pix"); }
          else if (e.key === "F3") { e.preventDefault(); setPaymentMethod("credito"); }
          else if (e.key === "F4") { e.preventDefault(); setPaymentMethod("debito"); }
        }
        if (e.key === "Escape") {
          setPaymentModalOpen(false);
          setClientModalOpen(false);
        }
      } else {
        if (e.key === "F2") {
          e.preventDefault();
          setPaymentModalOpen(true);
        } else if (e.key === "F3") {
          e.preventDefault();
          setClientModalOpen(true);
        } else if (e.key === "F4") {
          e.preventDefault();
          searchInputRef.current?.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [paymentModalOpen, clientModalOpen]);

  useEffect(() => {
    if (paymentModalOpen) {
      setTimeout(() => paymentInputRef.current?.focus(), 100);
    }
  }, [paymentModalOpen]);

  useEffect(() => {
    if (clientModalOpen) {
      setTimeout(() => clientSearchRef.current?.focus(), 100);
    }
  }, [clientModalOpen]);

  const handleProductClick = (product: Product) => {
    if (product.packagings && product.packagings.length > 1) {
      setPackagingSelectProduct(product);
      setPackagingSelectModalOpen(true);
    } else {
      const defaultPack = product.packagings?.[0];
      addPackagingToCart(product, defaultPack);
    }
  };

  const addPackagingToCart = (product: Product, pack?: any) => {
    let price = parseFloat(product.basePrice);
    let packId = null;
    let factor = 1;
    let displayName = product.name;

    if (pack) {
      price = parseFloat(pack.sellPrice || "0");
      packId = pack.id;
      factor = parseFloat(pack.conversionFactor || "1");
      if (pack.name !== "Unidade") {
        displayName = `${product.name} - ${pack.name}`;
      }
    }

    setCart((prev) => {
      const existing = prev.find(item => item.product.id === product.id && item.packagingId === packId);
      if (existing) {
        return prev.map(item => item.product.id === product.id && item.packagingId === packId
          ? { ...item, quantity: item.quantity + 1 } 
          : item
        );
      }
      return [...prev, { product, name: displayName, packagingId: packId, conversionFactor: factor, quantity: 1, unitPrice: price, discount: 0 }];
    });
    setSearchQuery("");
    setPackagingSelectModalOpen(false);
    searchInputRef.current?.focus();
  };

  const updateQuantity = (index: number, delta: number) => {
    setCart(prev => {
      const newCart = [...prev];
      const newQty = newCart[index].quantity + delta;
      if (newQty <= 0) {
        newCart.splice(index, 1);
      } else {
        newCart[index].quantity = newQty;
      }
      return newCart;
    });
  };

  const removeItem = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products.slice(0, 12);
    return products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 12);
  }, [searchQuery, products]);

  const filteredClients = useMemo(() => {
    if (!clientSearch) return clients.slice(0, 10);
    return clients.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase()) || (c.cpfCnpj && c.cpfCnpj.includes(clientSearch))).slice(0, 10);
  }, [clients, clientSearch]);

  const subtotal = cart.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  const itemsDiscount = cart.reduce((acc, item) => acc + item.discount, 0);
  const globalDiscountAmount = globalDiscountValue ? parseFloat(globalDiscountValue.replace(",", ".")) : 0;
  const totalDiscount = itemsDiscount + (isNaN(globalDiscountAmount) ? 0 : globalDiscountAmount);
  const total = subtotal - totalDiscount;

  const handleDiscountPercentChange = (val: string) => {
    setGlobalDiscountPercent(val);
    const p = parseFloat(val.replace(",", "."));
    if (!isNaN(p) && p > 0) {
      const baseForDiscount = subtotal - itemsDiscount;
      const calcValue = (baseForDiscount * (p / 100)).toFixed(2);
      setGlobalDiscountValue(calcValue);
    } else {
      setGlobalDiscountValue("");
    }
  };

  const handleDiscountValueChange = (val: string) => {
    setGlobalDiscountValue(val);
    const v = parseFloat(val.replace(",", "."));
    if (!isNaN(v) && v > 0) {
      const baseForDiscount = subtotal - itemsDiscount;
      if (baseForDiscount > 0) {
        const calcPercent = ((v / baseForDiscount) * 100).toFixed(2);
        setGlobalDiscountPercent(calcPercent);
      }
    } else {
      setGlobalDiscountPercent("");
    }
  };

  const handleFinishSale = async () => {
    setIsSubmitting(true);
    const payload = {
      subtotal,
      discount: totalDiscount,
      total,
      items: cart.map(item => ({
        productId: item.product.id,
        packagingId: item.packagingId,
        conversionFactor: item.conversionFactor,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        total: item.unitPrice * item.quantity - item.discount
      })),
      payments: [
        { method: paymentMethod, amount: amountPaid ? parseFloat(amountPaid.replace(",", ".")) : total }
      ]
    };

    const res = await fetch("/api/pdv/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      setReceiptSale({
        items: cart,
        total,
        subtotal,
        discount: totalDiscount,
        payments: [{ method: paymentMethod, amount: amountPaid ? parseFloat(amountPaid.replace(",", ".")) : total }],
        client: selectedClient,
        date: new Date().toLocaleString()
      });

      setCart([]);
      setPaymentModalOpen(false);
      setAmountPaid("");
      setGlobalDiscountValue("");
      setGlobalDiscountPercent("");
      setSearchQuery("");
      setSelectedClient(null);
    } else {
      alert("Erro ao finalizar venda.");
    }
    setIsSubmitting(false);
  };

  return (
    <>
    <div className="flex h-screen w-full flex-col md:flex-row overflow-hidden bg-slate-900 text-slate-100">
      
      {/* Esquerda: Carrinho */}
      <div className="flex flex-col w-full md:w-[45%] lg:w-[35%] h-full bg-slate-800 border-r border-slate-700 shadow-2xl relative z-10">
        {/* Cabeçalho do Carrinho */}
        <div className="p-4 bg-slate-800/80 backdrop-blur border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" title="Voltar ao Menu" className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-900 border border-slate-700 hover:border-indigo-500 hover:bg-indigo-500/10 text-slate-400 hover:text-indigo-400 transition-all shadow-sm">
              <Home className="h-5 w-5" />
            </Link>
            <div className="h-6 w-px bg-slate-700 mx-1"></div>
            <ShoppingCart className="h-5 w-5 text-indigo-400 hidden sm:block" />
            <h2 className="font-semibold text-lg tracking-tight">Cupom Atual</h2>
          </div>
          <button 
            onClick={() => setCart([])}
            className="text-xs font-medium text-slate-400 hover:text-red-400 transition-colors px-2 py-1 rounded"
          >
            Limpar
          </button>
        </div>

        {/* Cliente Selecionado */}
        <div className="px-4 py-3 border-b border-slate-700 bg-slate-800/50 flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
            <UserIcon className="h-4 w-4 text-slate-400" />
          </div>
          <div className="flex-1 min-w-0">
            {selectedClient ? (
              <>
                <p className="text-sm font-medium text-slate-200 truncate">{selectedClient.name}</p>
                <p className="text-xs text-slate-500">{selectedClient.cpfCnpj || "Sem CPF/CNPJ"}</p>
              </>
            ) : (
              <button onClick={() => setClientModalOpen(true)} className="text-sm text-indigo-400 font-medium hover:text-indigo-300 transition-colors">
                + Identificar Cliente (F3)
              </button>
            )}
          </div>
        </div>

        {/* Lista de Itens */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-3">
              <ShoppingCart className="h-12 w-12 opacity-20" />
              <p className="text-sm font-medium">O carrinho está vazio</p>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div key={idx} className="bg-slate-700/30 rounded-xl p-3 flex gap-3 group relative hover:bg-slate-700/50 transition-colors border border-transparent hover:border-slate-600">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-200 truncate">{item.name}</p>
                  <p className="text-xs text-slate-400">{formatCurrency(item.unitPrice)} x {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-100">{formatCurrency(item.unitPrice * item.quantity)}</p>
                </div>
                
                {/* Controles Overlay (aparece no hover) */}
                <div className="absolute inset-y-0 right-0 bg-slate-700/90 backdrop-blur-sm rounded-r-xl px-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => updateQuantity(idx, -1)} className="h-8 w-8 flex items-center justify-center rounded-lg bg-slate-600 text-slate-200 hover:bg-slate-500">
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                  <button onClick={() => updateQuantity(idx, 1)} className="h-8 w-8 flex items-center justify-center rounded-lg bg-slate-600 text-slate-200 hover:bg-slate-500">
                    <Plus className="h-4 w-4" />
                  </button>
                  <div className="w-px h-6 bg-slate-500 mx-1"></div>
                  <button onClick={() => removeItem(idx)} className="h-8 w-8 flex items-center justify-center rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totais do Carrinho */}
        <div className="bg-slate-950 p-5 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.3)] z-20 border-t border-slate-800">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-slate-400 text-sm">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {totalDiscount > 0 && (
              <div className="flex justify-between text-emerald-400 text-sm">
                <span>Descontos</span>
                <span>-{formatCurrency(totalDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between text-white text-2xl font-black mt-2 pt-2 border-t border-slate-800">
              <span>TOTAL</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
          
          <button 
            disabled={cart.length === 0}
            onClick={() => setPaymentModalOpen(true)}
            className="w-full h-14 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 text-lg font-bold rounded-xl transition-all disabled:opacity-50 disabled:hover:bg-emerald-500 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40"
          >
            PAGAMENTO (F2) <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Direita: Catálogo e Busca */}
      <div className="flex-1 flex flex-col h-full bg-slate-900">
        
        {/* Topbar Busca */}
        <div className="h-20 border-b border-slate-800 px-6 flex items-center gap-4 bg-slate-900/50 backdrop-blur sticky top-0 z-10">
          <div className="relative flex-1 max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar produto... (F4)"
              className="w-full pl-12 pr-4 h-12 bg-slate-800 border-2 border-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 rounded-2xl text-lg font-medium text-white placeholder:text-slate-500 transition-all outline-none"
            />
          </div>
        </div>

        {/* Grid de Produtos */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredProducts.map((p) => (
              <button
                key={p.id}
                onClick={() => handleProductClick(p)}
                className="flex flex-col text-left bg-slate-800 hover:bg-indigo-600/20 border border-slate-700 hover:border-indigo-500 rounded-2xl p-4 transition-all hover:-translate-y-1 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150" />
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{p.category || "Geral"}</span>
                <span className="font-semibold text-slate-200 text-sm md:text-base leading-tight mb-4 flex-1">{p.name}</span>
                <span className="text-lg font-bold text-emerald-400">{formatCurrency(parseFloat(p.basePrice))}</span>
              </button>
            ))}
          </div>
          {filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
              <Search className="h-10 w-10 mb-3 opacity-20" />
              <p>Nenhum produto encontrado</p>
            </div>
          )}
        </div>
      </div>

    </div>
    
      {/* Modal de Pagamento */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-full max-h-[500px]">
            {/* Esquerda: Total e Troco */}
            <div className="bg-slate-950 w-full md:w-2/5 p-8 flex flex-col justify-center border-b md:border-b-0 md:border-r border-slate-800">
              <p className="text-slate-400 font-medium mb-2 uppercase tracking-widest text-sm">Total a Pagar</p>
              <p className="text-4xl lg:text-5xl font-black text-emerald-400 mb-8">{formatCurrency(total)}</p>

              {amountPaid && parseFloat(amountPaid.replace(",", ".")) > total && (
                <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl animate-fade-in">
                  <p className="text-amber-500 text-sm font-semibold mb-1 uppercase tracking-wider">Troco</p>
                  <p className="text-3xl font-black text-amber-400">
                    {formatCurrency(parseFloat(amountPaid.replace(",", ".")) - total)}
                  </p>
                </div>
              )}
            </div>

            {/* Direita: Formas e Confirmação */}
            <div className="w-full md:w-3/5 p-6 md:p-8 flex flex-col relative">
              <button onClick={() => setPaymentModalOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors">
                <X className="h-6 w-6" />
              </button>

              <h3 className="text-xl font-bold text-white mb-6">Forma de Pagamento</h3>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { id: "dinheiro", label: "Dinheiro", icon: <Banknote className="h-5 w-5" />, keyDigit: "F1" },
                  { id: "pix", label: "PIX", icon: <QrCode className="h-5 w-5" />, keyDigit: "F2" },
                  { id: "credito", label: "Crédito", icon: <CreditCard className="h-5 w-5" />, keyDigit: "F3" },
                  { id: "debito", label: "Débito", icon: <CreditCard className="h-5 w-5" />, keyDigit: "F4" },
                ].map(pm => (
                  <button
                    key={pm.id}
                    onClick={() => setPaymentMethod(pm.id)}
                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all font-semibold relative overflow-hidden ${
                      paymentMethod === pm.id 
                      ? "border-indigo-500 bg-indigo-500/10 text-indigo-400" 
                      : "border-slate-800 bg-slate-800/50 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                    }`}
                  >
                    <span className="absolute top-2 right-2 flex items-center justify-center min-w-[24px] h-6 px-1 text-[11px] font-bold rounded bg-slate-800/80 text-slate-400">
                      {pm.keyDigit}
                    </span>
                    {pm.icon}
                    {pm.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-slate-400 font-medium mb-2 text-sm uppercase tracking-wider">Desconto (R$)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium text-lg">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={globalDiscountValue}
                      onChange={(e) => handleDiscountValueChange(e.target.value)}
                      className="w-full pl-12 pr-4 h-12 bg-slate-950 border-2 border-slate-800 focus:border-indigo-500 rounded-xl text-lg font-bold text-white placeholder:text-slate-600 transition-all outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-2 text-sm uppercase tracking-wider">Desconto (%)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium text-lg">%</span>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={globalDiscountPercent}
                      onChange={(e) => handleDiscountPercentChange(e.target.value)}
                      className="w-full pl-12 pr-4 h-12 bg-slate-950 border-2 border-slate-800 focus:border-indigo-500 rounded-xl text-lg font-bold text-white placeholder:text-slate-600 transition-all outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-slate-400 font-medium mb-2 text-sm uppercase tracking-wider">Valor Recebido (Opcional)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium text-lg">R$</span>
                  <input
                    ref={paymentInputRef}
                    type="number"
                    step="0.01"
                    placeholder={total.toFixed(2)}
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    className="w-full pl-12 pr-4 h-14 bg-slate-950 border-2 border-slate-800 focus:border-indigo-500 rounded-2xl text-xl font-bold text-white placeholder:text-slate-600 transition-all outline-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleFinishSale();
                    }}
                  />
                </div>
              </div>

              <button
                onClick={handleFinishSale}
                disabled={isSubmitting}
                className="mt-auto w-full h-14 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 text-lg font-black rounded-2xl transition-all disabled:opacity-50 disabled:hover:bg-emerald-500 shadow-lg shadow-emerald-500/20"
              >
                {isSubmitting ? "PROCESSANDO..." : "FINALIZAR VENDA (Enter)"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Cliente */}
      {clientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[500px]">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Identificar Cliente</h3>
              <button onClick={() => setClientModalOpen(false)} className="text-slate-500 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 flex-1 overflow-hidden flex flex-col">
              <input
                ref={clientSearchRef}
                type="text"
                placeholder="Buscar por nome ou CPF/CNPJ..."
                value={clientSearch}
                onChange={e => setClientSearch(e.target.value)}
                className="w-full mb-4 px-4 h-12 bg-slate-950 border-2 border-slate-800 focus:border-indigo-500 rounded-xl text-white placeholder:text-slate-600 transition-all outline-none"
              />
              <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {filteredClients.length > 0 ? (
                  filteredClients.map(c => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setSelectedClient(c);
                        setClientModalOpen(false);
                        setClientSearch("");
                      }}
                      className="w-full text-left p-4 rounded-xl border border-slate-800 hover:border-indigo-500 hover:bg-indigo-500/10 transition-colors flex flex-col"
                    >
                      <span className="font-semibold text-slate-200">{c.name}</span>
                      <span className="text-sm text-slate-500">{c.cpfCnpj || "Sem documento"}</span>
                    </button>
                  ))
                ) : (
                  <p className="text-center text-slate-500 py-4">Nenhum cliente encontrado.</p>
                )}
              </div>
              {selectedClient && (
                <button
                  onClick={() => {
                    setSelectedClient(null);
                    setClientModalOpen(false);
                  }}
                  className="mt-4 w-full h-12 bg-slate-800 hover:bg-slate-700 text-red-400 hover:text-red-300 rounded-xl transition-colors font-medium"
                >
                  Remover Identificação
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Recibo */}
      {receiptSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-white text-black w-full max-w-sm rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="p-6 overflow-y-auto font-mono text-sm print:p-0 print:w-full print:h-full print:fixed print:left-0 print:top-0 print:bg-white print:text-black print:z-[9999] custom-scrollbar">
              <div className="text-center mb-4 border-b border-black pb-4 border-dashed">
                <h2 className="font-bold text-lg">Gráfica São João</h2>
                <p>Cupom Não Fiscal</p>
                <p>{receiptSale.date}</p>
              </div>
              <div className="mb-4 border-b border-black pb-4 border-dashed">
                <p><strong>Cliente:</strong> {receiptSale.client ? receiptSale.client.name : "Não identificado"}</p>
                {receiptSale.client && receiptSale.client.cpfCnpj && <p><strong>CPF/CNPJ:</strong> {receiptSale.client.cpfCnpj}</p>}
              </div>
              <table className="w-full mb-4">
                <thead>
                  <tr className="border-b border-black border-dashed">
                    <th className="text-left py-1">Item</th>
                    <th className="text-right py-1">Qtd</th>
                    <th className="text-right py-1">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {receiptSale.items.map((i: any, idx: number) => (
                    <tr key={idx}>
                      <td className="py-1 pr-2 truncate max-w-[120px]">{i.name}</td>
                      <td className="text-right py-1">{i.quantity}</td>
                      <td className="text-right py-1">{formatCurrency(i.unitPrice * i.quantity - i.discount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="border-t border-black pt-4 border-dashed space-y-1">
                <div className="flex justify-between"><span>Subtotal:</span><span>{formatCurrency(receiptSale.subtotal)}</span></div>
                {receiptSale.discount > 0 && <div className="flex justify-between"><span>Descontos:</span><span>-{formatCurrency(receiptSale.discount)}</span></div>}
                <div className="flex justify-between font-bold text-lg mt-2"><span>Total:</span><span>{formatCurrency(receiptSale.total)}</span></div>
              </div>
              <div className="mt-4 border-t border-black pt-4 border-dashed text-center">
                <p>Obrigado pela preferência!</p>
              </div>
            </div>
            <div className="p-4 bg-slate-100 flex gap-2 print:hidden border-t border-slate-200">
              <button onClick={() => window.print()} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg transition-colors">
                Imprimir
              </button>
              <button 
                onClick={() => {
                  setReceiptSale(null);
                  setTimeout(() => searchInputRef.current?.focus(), 100);
                }} 
                className="flex-1 bg-slate-300 hover:bg-slate-400 text-slate-800 font-medium py-3 rounded-lg transition-colors"
              >
                Nova Venda
              </button>
            </div>
          </div>
        </div>
      )}

      {packagingSelectModalOpen && packagingSelectProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Selecione a Embalagem</h3>
              <button onClick={() => setPackagingSelectModalOpen(false)} className="text-slate-500 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-3">
              <p className="text-sm text-slate-400 mb-2">{packagingSelectProduct.name}</p>
              {packagingSelectProduct.packagings?.map((pack, idx) => (
                <button
                  key={idx}
                  onClick={() => addPackagingToCart(packagingSelectProduct, pack)}
                  className="w-full text-left p-4 rounded-xl border border-slate-700 hover:border-indigo-500 hover:bg-indigo-500/10 transition-colors flex justify-between items-center"
                >
                  <span className="font-semibold text-slate-200">{pack.name}</span>
                  <span className="text-emerald-400 font-bold">{formatCurrency(parseFloat(pack.sellPrice))}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </>
  );
}
