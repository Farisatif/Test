import { createContext, type ChangeEvent, type FormEvent, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { Link, Redirect, Route, Router as WouterRouter, Switch, useLocation, useParams } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClerkProvider, Show, SignIn, SignUp, useAuth, useClerk, useUser } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  CircleHelp,
  Heart,
  LayoutGrid,
  Minus,
  Package,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  Tag,
  Trash2,
  Truck,
  UserRound,
} from 'lucide-react';
import {
  getGetDashboardSummaryQueryKey,
  getGetProductQueryKey,
  getListCategoriesQueryKey,
  getListProductsQueryKey,
  useCreateOrder,
  useGetDashboardSummary,
  useGetProduct,
  useListCategories,
  useListProducts,
} from '@workspace/api-client-react';
import type { Category, OrderInput, Product } from '@workspace/api-client-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import './index.css';

const queryClient = new QueryClient();
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || '/'
    : path;
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: 'clerk',
  options: {
    logoPlacement: 'inside' as const,
    logoLinkUrl: basePath || '/',
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: '#B2054C',
    colorForeground: '#4D092B',
    colorMutedForeground: '#806A67',
    colorDanger: '#D10056',
    colorBackground: '#FBFAF6',
    colorInput: '#F7F4ED',
    colorInputForeground: '#4D092B',
    colorNeutral: '#D8CFC1',
    fontFamily: 'DM Sans, sans-serif',
    borderRadius: '1rem',
  },
  elements: {
    rootBox: 'w-full flex justify-center',
    cardBox: 'bg-[#fbfaf6] rounded-3xl w-[440px] max-w-full overflow-hidden border border-[#e5ded2] shadow-xl',
    card: '!shadow-none !border-0 !bg-transparent !rounded-none',
    footer: '!shadow-none !border-0 !bg-transparent !rounded-none',
    headerTitle: 'font-display text-[#4d092b] font-bold',
    headerSubtitle: 'text-[#806a67]',
    socialButtonsBlockButtonText: 'text-[#4d092b] font-bold',
    formFieldLabel: 'text-[#4d092b] font-bold',
    footerActionLink: 'text-[#b2054c] font-bold',
    footerActionText: 'text-[#806a67]',
    dividerText: 'text-[#806a67]',
    identityPreviewEditButton: 'text-[#b2054c]',
    formFieldSuccessText: 'text-[#285d28]',
    alertText: 'text-[#4d092b]',
    logoBox: 'mb-2',
    logoImage: 'h-11 w-11',
    socialButtonsBlockButton: 'border-[#d8cfc1] bg-[#f7f4ed] hover:bg-[#eee8dc]',
    formButtonPrimary: 'bg-[#b2054c] hover:bg-[#d10056] text-[#fffaf0] font-bold',
    formFieldInput: 'border-[#d8cfc1] bg-[#f7f4ed] text-[#4d092b]',
    footerAction: 'border-t border-[#e5ded2]',
    dividerLine: 'bg-[#d8cfc1]',
    alert: 'bg-[#fff1f3] border-[#d10056]',
    otpCodeFieldInput: 'border-[#d8cfc1] bg-[#f7f4ed] text-[#4d092b]',
    formFieldRow: 'gap-2',
    main: 'gap-5',
  },
};

type CartLine = { product: Product; quantity: number };
type CartContextValue = {
  cart: CartLine[];
  addToCart: (product: Product, quantity?: number) => void;
  setQuantity: (id: number, quantity: number) => void;
  removeFromCart: (id: number) => void;
  cartCount: number;
  cartTotal: number;
  favorites: number[];
  toggleFavorite: (id: number) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside CartProvider');
  return context;
}

function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>(() => {
    try { return JSON.parse(localStorage.getItem('bazaar-cart') || '[]') as CartLine[]; } catch { return []; }
  });
  const [favorites, setFavorites] = useState<number[]>(() => {
    try { return JSON.parse(localStorage.getItem('bazaar-favorites') || '[]') as number[]; } catch { return []; }
  });
  useEffect(() => { localStorage.setItem('bazaar-cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('bazaar-favorites', JSON.stringify(favorites)); }, [favorites]);
  const addToCart = (product: Product, quantity = 1) => setCart(current => {
    const found = current.find(line => line.product.id === product.id);
    return found
      ? current.map(line => line.product.id === product.id ? { ...line, quantity: line.quantity + quantity } : line)
      : [...current, { product, quantity }];
  });
  const setQuantity = (id: number, quantity: number) => setCart(current => quantity < 1 ? current.filter(line => line.product.id !== id) : current.map(line => line.product.id === id ? { ...line, quantity } : line));
  const removeFromCart = (id: number) => setCart(current => current.filter(line => line.product.id !== id));
  const toggleFavorite = (id: number) => setFavorites(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
  const value = {
    cart, addToCart, setQuantity, removeFromCart, favorites, toggleFavorite,
    cartCount: cart.reduce((total, line) => total + line.quantity, 0),
    cartTotal: cart.reduce((total, line) => total + line.quantity * line.product.price, 0),
  };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

function money(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

const categoryColors = ['#7EC151', '#FFB900', '#007DCC', '#B2054C', '#D10056'];
function imageFallback(seed: number) {
  const color = categoryColors[Math.abs(seed) % categoryColors.length];
  return { background: `linear-gradient(145deg, ${color}, #f7f4ed 78%)`, color };
}

function ProductImage({ product, className = '' }: { product: Product; className?: string }) {
  const [failed, setFailed] = useState(false);
  return product.image && !failed
    ? <img src={product.image} alt={product.name} onError={() => setFailed(true)} className={`h-full w-full object-cover ${className}`} />
    : <div className={`h-full w-full flex items-end p-4 ${className}`} style={imageFallback(product.id)}>
        <span className="font-display text-5xl leading-none tracking-tight text-[#4d092b]/80">{product.name.slice(0, 1)}</span>
      </div>;
}

function LoadingGrid() {
  return <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">{Array.from({ length: 8 }).map((_, i) =>
    <div key={i} className="animate-pulse"><div className="aspect-[4/5] rounded-2xl bg-[#e8e4d8]" /><div className="mt-3 h-3 w-2/3 rounded bg-[#e8e4d8]" /><div className="mt-2 h-3 w-1/3 rounded bg-[#e8e4d8]" /></div>
  )}</div>;
}

function DataMessage({ title, body, onRetry }: { title: string; body: string; onRetry?: () => void }) {
  return <div className="rounded-3xl border border-dashed border-[#d3cbbd] bg-[#fbfaf6] px-6 py-16 text-center">
    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#ffb900]/20 text-[#7f5600]"><CircleHelp size={25} /></div>
    <h3 className="font-display text-2xl text-[#4d092b]">{title}</h3><p className="mx-auto mt-2 max-w-md text-sm text-[#7f665e]">{body}</p>
    {onRetry && <button data-testid="button-retry" onClick={onRetry} className="mt-5 rounded-full bg-[#b2054c] px-5 py-2.5 text-sm font-bold text-[#fffaf0]">Try again</button>}
  </div>;
}

function Header() {
  const { cartCount } = useCart();
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();
  const isAdmin = user?.publicMetadata?.role === 'admin';
  const firstName = user?.firstName || user?.primaryEmailAddress?.emailAddress?.split('@')[0];
  return <header className="sticky top-0 z-40 border-b border-[#e5ded2] bg-[#f7f4ed]/95 backdrop-blur">
    <div className="mx-auto flex h-[74px] max-w-[1400px] items-center justify-between gap-4 px-5 lg:px-8">
      <button data-testid="button-mobile-menu" onClick={() => setMenuOpen(!menuOpen)} className="rounded-full p-2 text-[#4d092b] md:hidden"><LayoutGrid size={20} /></button>
      <Link href="/" data-testid="link-logo" className="group flex items-center gap-2">
        <span className="flex h-9 w-9 rotate-[-8deg] items-center justify-center rounded-[11px] bg-[#b2054c] text-[#f7f4ed] transition-transform group-hover:rotate-0"><Sparkles size={19} /></span>
        <span className="font-display text-2xl font-bold tracking-[-.06em] text-[#4d092b]">bazaar<span className="text-[#d10056]">.</span></span>
      </Link>
      <nav className="hidden items-center gap-8 md:flex">
        {[['/', 'Home'], ['/shop', 'Shop'], ['/shop?category=New', 'New in']].map(([href, label]) =>
          <Link key={href} href={href} data-testid={`link-nav-${label.toLowerCase().replace(' ', '-')}`} className={`text-sm font-bold transition-colors hover:text-[#b2054c] ${location === href ? 'text-[#b2054c]' : 'text-[#6e504f]'}`}>{label}</Link>
        )}
      </nav>
      <div className="flex items-center gap-1">
        <Link href="/shop" data-testid="link-search" className="rounded-full p-2.5 text-[#4d092b] hover:bg-[#ece6d9]"><Search size={19} /></Link>
        {isSignedIn ? <div className="group relative hidden sm:block">
          <button data-testid="button-account" className="flex items-center gap-2 rounded-full p-2.5 text-[#4d092b] hover:bg-[#ece6d9]"><UserRound size={19} /><span className="max-w-20 truncate text-xs font-bold">{firstName}</span></button>
          <div className="invisible absolute right-0 top-12 w-48 translate-y-1 rounded-2xl border border-[#e5ded2] bg-[#fbfaf6] p-2 opacity-0 shadow-xl transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
            <div className="border-b border-[#e5ded2] px-3 py-2"><p className="truncate text-xs font-bold text-[#4d092b]">{user?.fullName || firstName}</p><p className="truncate text-[10px] text-[#917872]">{user?.primaryEmailAddress?.emailAddress}</p></div>
            {isAdmin && <Link href="/dashboard" className="mt-1 block rounded-xl px-3 py-2 text-xs font-bold text-[#4d092b] hover:bg-[#f0eadf]">Dashboard</Link>}
            <button onClick={() => signOut({ redirectUrl: basePath || '/' })} className="mt-1 w-full rounded-xl px-3 py-2 text-left text-xs font-bold text-[#b2054c] hover:bg-[#fff0f3]">Sign out</button>
          </div>
        </div> : <Link href="/sign-in" data-testid="button-account" className="hidden rounded-full p-2.5 text-[#4d092b] hover:bg-[#ece6d9] sm:block"><UserRound size={19} /></Link>}
        <Link href="/cart" data-testid="link-cart" className="relative rounded-full p-2.5 text-[#4d092b] hover:bg-[#ece6d9]"><ShoppingBag size={20} />
          {cartCount > 0 && <span data-testid="text-cart-count" className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ffb900] px-1 font-mono text-[10px] font-bold text-[#4d092b]">{cartCount}</span>}
        </Link>
      </div>
    </div>
    {menuOpen && <nav className="border-t border-[#e5ded2] bg-[#f7f4ed] px-5 py-4 md:hidden">
       <div className="flex flex-col gap-3">{[['/', 'Home'], ['/shop', 'Shop'], ['/shop?category=New', 'New in'], ...(isSignedIn ? [['/account', 'My account']] : [['/sign-in', 'Sign in']]), ...(isAdmin ? [['/dashboard', 'Dashboard']] : [])].map(([href, label]) =>
        <Link key={href} href={href} data-testid={`link-mobile-${label.toLowerCase().replace(' ', '-')}`} onClick={() => setMenuOpen(false)} className="border-b border-[#e5ded2] pb-3 text-sm font-bold text-[#4d092b]">{label}</Link>
      )}</div>
    </nav>}
  </header>;
}

function GuestHeader() {
  const { cartCount } = useCart();
  return <header className="sticky top-0 z-40 border-b border-[#e5ded2] bg-[#f7f4ed]/95 backdrop-blur">
    <div className="mx-auto flex h-[74px] max-w-[1400px] items-center justify-between gap-4 px-5 lg:px-8">
      <Link href="/" data-testid="link-logo" className="group flex items-center gap-2">
        <span className="flex h-9 w-9 rotate-[-8deg] items-center justify-center rounded-[11px] bg-[#b2054c] text-[#f7f4ed] transition-transform group-hover:rotate-0"><Sparkles size={19} /></span>
        <span className="font-display text-2xl font-bold tracking-[-.06em] text-[#4d092b]">bazaar<span className="text-[#d10056]">.</span></span>
      </Link>
      <nav className="hidden items-center gap-8 md:flex">
        <Link href="/" className="text-sm font-bold text-[#6e504f] hover:text-[#b2054c]">Home</Link>
        <Link href="/shop" className="text-sm font-bold text-[#6e504f] hover:text-[#b2054c]">Shop</Link>
        <Link href="/shop?category=New" className="text-sm font-bold text-[#6e504f] hover:text-[#b2054c]">New in</Link>
      </nav>
      <div className="flex items-center gap-1">
        <Link href="/shop" data-testid="link-search" className="rounded-full p-2.5 text-[#4d092b] hover:bg-[#ece6d9]"><Search size={19} /></Link>
        <Link href="/cart" data-testid="link-cart" className="relative rounded-full p-2.5 text-[#4d092b] hover:bg-[#ece6d9]"><ShoppingBag size={20} />
          {cartCount > 0 && <span data-testid="text-cart-count" className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ffb900] px-1 font-mono text-[10px] font-bold text-[#4d092b]">{cartCount}</span>}
        </Link>
      </div>
    </div>
  </header>;
}

function Footer() {
  return <footer className="mt-24 border-t border-[#e5ded2] bg-[#4d092b] text-[#f7f4ed]">
    <div className="mx-auto grid max-w-[1400px] gap-10 px-5 py-14 md:grid-cols-[1.3fr_1fr_1fr_1fr] lg:px-8">
      <div><div className="font-display text-3xl font-bold tracking-[-.05em]">bazaar<span className="text-[#ffb900]">.</span></div><p className="mt-4 max-w-xs text-sm leading-6 text-[#dbc7cb]">Small joys, good finds, and the things you reach for every day.</p><div className="mt-7 font-mono text-xs uppercase tracking-[.18em] text-[#7ec151]">Made for the curious</div></div>
      <div><p className="font-mono text-[10px] uppercase tracking-[.2em] text-[#ffb900]">Explore</p><div className="mt-4 flex flex-col gap-3 text-sm text-[#f1dfe1]"><Link href="/shop" data-testid="link-footer-shop">All products</Link><Link href="/shop?category=Apparel" data-testid="link-footer-apparel">Apparel</Link><Link href="/shop?category=Home" data-testid="link-footer-home">Home objects</Link></div></div>
      <div><p className="font-mono text-[10px] uppercase tracking-[.2em] text-[#ffb900]">Help</p><div className="mt-4 flex flex-col gap-3 text-sm text-[#f1dfe1]"><button data-testid="button-footer-shipping" onClick={() => alert('Standard delivery arrives in 3–5 business days.')} className="text-left">Shipping & returns</button><button data-testid="button-footer-contact" onClick={() => alert('Write to hello@bazaar.shop')} className="text-left">Contact us</button></div></div>
      <div><p className="font-mono text-[10px] uppercase tracking-[.2em] text-[#ffb900]">Get the good stuff</p><p className="mt-4 text-sm leading-6 text-[#f1dfe1]">A considered edit in your inbox, once in a while.</p><div className="mt-4 flex border-b border-[#9f7485] pb-2"><input data-testid="input-footer-email" placeholder="Your email" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#b8979e]" /><button data-testid="button-footer-subscribe" onClick={() => alert('You are on the list.')}><ArrowRight size={18} /></button></div></div>
    </div>
    <div className="border-t border-[#71445a] px-5 py-5 text-center font-mono text-[10px] uppercase tracking-[.18em] text-[#b8979e]">© 2025 Bazaar · good things, fairly found</div>
  </footer>;
}

function Shell({ children }: { children: ReactNode }) {
  return <div className="bazaar-grain min-h-[100dvh] bg-[#f7f4ed]">{clerkPubKey ? <Header /> : <GuestHeader />}{children}<Footer /></div>;
}

function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { addToCart, favorites, toggleFavorite } = useCart();
  const isFavorite = favorites.includes(product.id);
  const [added, setAdded] = useState(false);
  const add = () => { addToCart(product); setAdded(true); window.setTimeout(() => setAdded(false), 1400); };
  return <article data-testid={`card-product-${product.id}`} className="reveal group relative" style={{ animationDelay: `${index * 45}ms` }}>
    <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#e9e4d8]">
      <Link href={`/product/${product.id}`} data-testid={`link-product-image-${product.id}`} className="block h-full"><ProductImage product={product} /></Link>
      {product.badge && <span data-testid={`badge-product-${product.id}`} className="absolute left-3 top-3 rounded-full bg-[#ffb900] px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[.1em] text-[#4d092b]">{product.badge}</span>}
      <button data-testid={`button-favorite-${product.id}`} onClick={() => toggleFavorite(product.id)} aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'} className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border ${isFavorite ? 'border-[#d10056] bg-[#d10056] text-[#fffaf0]' : 'border-[#f7f4ed]/70 bg-[#f7f4ed]/80 text-[#4d092b]'} backdrop-blur transition-transform hover:scale-105`}><Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} /></button>
      <button data-testid={`button-add-product-${product.id}`} onClick={add} className={`absolute bottom-3 left-3 right-3 translate-y-2 rounded-full py-3 text-sm font-bold opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100 ${added ? 'bg-[#7ec151] text-[#4d092b]' : 'bg-[#b2054c] text-[#fffaf0]'}`}>{added ? 'Added to bag' : 'Add to bag'}</button>
    </div>
    <Link href={`/product/${product.id}`} data-testid={`link-product-name-${product.id}`} className="mt-3 block"><div className="flex items-start justify-between gap-2"><h3 className="font-display text-[17px] font-semibold leading-tight text-[#4d092b]">{product.name}</h3><span className="shrink-0 font-mono text-xs font-medium text-[#4d092b]">{money(product.price)}</span></div><p className="mt-1 text-xs text-[#917872]">{product.category}</p></Link>
  </article>;
}

function SectionHeading({ eyebrow, title, action }: { eyebrow: string; title: string; action?: string }) {
  return <div className="mb-7 flex items-end justify-between gap-4"><div><p className="font-mono text-[10px] font-medium uppercase tracking-[.2em] text-[#b2054c]">{eyebrow}</p><h2 className="mt-2 font-display text-3xl font-bold tracking-[-.045em] text-[#4d092b] md:text-4xl">{title}</h2></div>{action && <Link href="/shop" data-testid="link-section-shop" className="hidden items-center gap-2 pb-1 text-sm font-bold text-[#b2054c] sm:flex">{action}<ArrowRight size={16} /></Link>}</div>;
}

function HomePage() {
  const featuredQuery = useListProducts({ featured: true }, { query: { queryKey: getListProductsQueryKey({ featured: true }) } });
  const categoriesQuery = useListCategories({ query: { queryKey: getListCategoriesQueryKey() } });
  const products = featuredQuery.data || [];
  const categories = categoriesQuery.data || [];
  return <Shell><main>
    <section className="mx-auto max-w-[1400px] px-5 pb-12 pt-8 lg:px-8 lg:pt-12">
      <div className="relative min-h-[520px] overflow-hidden rounded-[2rem] bg-[#7ec151] px-7 py-10 md:px-14 md:py-14">
        <div className="pointer-events-none absolute -right-12 -top-20 h-[430px] w-[430px] rounded-full border-[45px] border-[#ffb900] opacity-90 md:h-[600px] md:w-[600px]" />
        <div className="pointer-events-none absolute bottom-[-120px] right-[18%] h-[300px] w-[300px] rounded-full bg-[#d10056] md:h-[440px] md:w-[440px]" />
        <div className="relative z-10 flex max-w-xl flex-col justify-between md:min-h-[410px]"><p className="font-mono text-[11px] font-medium uppercase tracking-[.22em] text-[#285d28]">The everyday edit · 01</p><div className="mt-24 md:mt-0"><h1 className="font-display text-[clamp(3.5rem,9vw,7.5rem)] font-bold leading-[.85] tracking-[-.08em] text-[#4d092b]">Find your<br /><span className="text-[#fff3d3]">little wow.</span></h1><p className="mt-7 max-w-sm text-base leading-6 text-[#285d28]">A bright edit of clothes, objects, and small upgrades for the way you live now.</p><Link href="/shop" data-testid="link-hero-shop" className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#b2054c] px-6 py-3.5 text-sm font-bold text-[#fffaf0] shadow-[0_8px_0_#7e133f] transition-transform hover:translate-y-0.5 hover:shadow-[0_5px_0_#7e133f]">Shop the edit <ArrowRight size={17} /></Link></div></div>
        <div className="absolute bottom-7 right-8 z-10 hidden w-44 rotate-[-7deg] rounded-2xl bg-[#f7f4ed] p-3 shadow-2xl md:block"><div className="flex aspect-square items-center justify-center rounded-xl bg-[#007dcc] text-center font-display text-5xl font-bold leading-[.8] text-[#ffb900]">good<br />stuff</div><p className="mt-2 font-mono text-[9px] uppercase tracking-[.15em] text-[#4d092b]">Curated with care</p></div>
      </div>
    </section>
    <div className="overflow-hidden border-y border-[#e5ded2] bg-[#ffb900] py-3"><div className="marquee flex w-max items-center gap-8 font-mono text-[10px] font-bold uppercase tracking-[.2em] text-[#4d092b]"><span>Fresh finds</span><span>+</span><span>Easy does it</span><span>+</span><span>Small joys</span><span>+</span><span>Fresh finds</span><span>+</span><span>Easy does it</span><span>+</span><span>Small joys</span><span>+</span></div></div>
    <section className="mx-auto max-w-[1400px] px-5 py-16 lg:px-8"><SectionHeading eyebrow="Browse by mood" title="Something for every you." action="See everything" />{categoriesQuery.isLoading ? <LoadingGrid /> : categoriesQuery.isError ? <DataMessage title="The shelves are taking a minute." body="We couldn't load collections right now." onRetry={() => categoriesQuery.refetch()} /> : <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{categories.slice(0, 4).map((category: Category, i) => <Link href={`/shop?category=${encodeURIComponent(category.name)}`} data-testid={`card-category-${category.id}`} key={category.id} className={`group relative min-h-[175px] overflow-hidden rounded-2xl p-5 ${i === 0 ? 'bg-[#007dcc]' : i === 1 ? 'bg-[#d10056]' : i === 2 ? 'bg-[#ffb900]' : 'bg-[#7ec151]'}`}><div className="absolute -bottom-10 -right-5 h-36 w-36 rounded-full bg-[#f7f4ed]/20 transition-transform duration-500 group-hover:scale-125" /><p className={`relative font-display text-2xl font-bold tracking-[-.05em] ${i === 2 ? 'text-[#4d092b]' : 'text-[#fffaf0]'}`}>{category.name}</p><p className={`relative mt-2 font-mono text-[10px] uppercase tracking-[.15em] ${i === 2 ? 'text-[#4d092b]/70' : 'text-[#fffaf0]/75'}`}>{category.count} pieces</p><ArrowRight className={`absolute bottom-5 right-5 transition-transform group-hover:translate-x-1 ${i === 2 ? 'text-[#4d092b]' : 'text-[#fffaf0]'}`} size={19} /></Link>)}</div>}</section>
    <section className="mx-auto max-w-[1400px] px-5 pb-10 lg:px-8"><SectionHeading eyebrow="Just in" title="The good stuff, lately." action="Shop all" />{featuredQuery.isLoading ? <LoadingGrid /> : featuredQuery.isError ? <DataMessage title="A tiny shelf wobble." body="Featured products couldn't load. Give it another go." onRetry={() => featuredQuery.refetch()} /> : products.length ? <div className="grid grid-cols-2 gap-x-3 gap-y-9 md:grid-cols-3 lg:grid-cols-4">{products.slice(0, 8).map((product: Product, i) => <ProductCard product={product} index={i} key={product.id} />)}</div> : <DataMessage title="New finds are on their way." body="Check back soon for the next drop." />}</section>
    <section className="mx-auto max-w-[1400px] px-5 py-14 lg:px-8"><div className="grid items-center gap-8 rounded-[2rem] bg-[#007dcc] p-8 md:grid-cols-[1fr_1.2fr] md:p-12"><div><p className="font-mono text-[10px] uppercase tracking-[.2em] text-[#ffda69]">Why Bazaar</p><h2 className="mt-3 font-display text-4xl font-bold leading-[.92] tracking-[-.06em] text-[#fffaf0] md:text-5xl">Good taste.<br />No gatekeeping.</h2><p className="mt-5 max-w-sm text-sm leading-6 text-[#d8effb]">We look for things that earn their place: useful, joyful, and made to be lived with.</p></div><div className="grid grid-cols-2 gap-3"><div className="rounded-2xl bg-[#f7f4ed] p-5"><Truck className="text-[#b2054c]" size={21} /><p className="mt-12 font-display text-xl font-bold text-[#4d092b]">Easy delivery</p><p className="mt-1 text-xs text-[#8a6c65]">Free over $75</p></div><div className="mt-8 rounded-2xl bg-[#ffb900] p-5"><Heart className="text-[#b2054c]" size={21} /><p className="mt-12 font-display text-xl font-bold text-[#4d092b]">Loved things</p><p className="mt-1 text-xs text-[#4d092b]/70">Picked by people</p></div></div></div></section>
    <Newsletter />
  </main></Shell>;
}

function Newsletter() {
  const [sent, setSent] = useState(false);
  return <section className="mx-auto max-w-[1400px] px-5 py-14 lg:px-8"><div className="border-y border-[#d8cfc1] py-10 text-center"><p className="font-mono text-[10px] uppercase tracking-[.2em] text-[#b2054c]">A note from the bazaar</p><h2 className="mt-3 font-display text-3xl font-bold tracking-[-.04em] text-[#4d092b]">The good kind of inbox noise.</h2><p className="mt-2 text-sm text-[#917872]">New drops, useful ideas, zero hard sell.</p><div className="mx-auto mt-6 flex max-w-sm border-b border-[#4d092b] pb-2"><input data-testid="input-newsletter" placeholder="Email address" className="min-w-0 flex-1 bg-transparent text-sm text-[#4d092b] outline-none placeholder:text-[#a28d84]" /><button data-testid="button-newsletter" onClick={() => setSent(true)} className="font-bold text-[#b2054c]">{sent ? <Check size={18} /> : 'Join us'}</button></div></div></section>;
}

function ShopPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(() => new URLSearchParams(window.location.search).get('category') || 'All');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [sort, setSort] = useState('featured');
  const categoriesQuery = useListCategories({ query: { queryKey: getListCategoriesQueryKey() } });
  const params = useMemo(() => ({ search: search || undefined, category: category === 'All' ? undefined : category, featured: featuredOnly || undefined }), [search, category, featuredOnly]);
  const productsQuery = useListProducts(params, { query: { queryKey: getListProductsQueryKey(params) } });
  const products = useMemo(() => {
    const list = [...(productsQuery.data || [])];
    if (sort === 'low') return list.sort((a, b) => a.price - b.price);
    if (sort === 'high') return list.sort((a, b) => b.price - a.price);
    return list;
  }, [productsQuery.data, sort]);
  return <Shell><main className="mx-auto max-w-[1400px] px-5 py-10 lg:px-8 lg:py-14"><div className="flex flex-col justify-between gap-5 border-b border-[#d8cfc1] pb-9 md:flex-row md:items-end"><div><p className="font-mono text-[10px] uppercase tracking-[.2em] text-[#b2054c]">The bazaar / 01</p><h1 className="mt-2 font-display text-5xl font-bold tracking-[-.07em] text-[#4d092b] md:text-7xl">All the good things.</h1></div><p className="max-w-xs text-sm leading-6 text-[#917872]">Everyday pieces with a point of view. Find something useful, or just something that makes you smile.</p></div>
    <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div className="relative w-full md:max-w-sm"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#917872]" size={17} /><input data-testid="input-shop-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search the bazaar" className="h-12 w-full rounded-full border border-[#d8cfc1] bg-[#fbfaf6] pl-11 pr-4 text-sm text-[#4d092b] outline-none ring-[#b2054c] focus:ring-2" /></div><div className="flex items-center gap-2 overflow-x-auto pb-1">{['All', ...(categoriesQuery.data || []).map((c: Category) => c.name)].map(item => <button key={item} data-testid={`button-filter-${item.toLowerCase().replace(/\s/g, '-')}`} onClick={() => setCategory(item)} className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-bold transition-colors ${category === item ? 'border-[#b2054c] bg-[#b2054c] text-[#fffaf0]' : 'border-[#d8cfc1] text-[#6e504f] hover:border-[#b2054c]'}`}>{item}</button>)}</div></div>
    <div className="mt-5 flex items-center justify-between border-b border-[#e5ded2] pb-5"><button data-testid="button-featured-filter" onClick={() => setFeaturedOnly(!featuredOnly)} className={`flex items-center gap-2 text-xs font-bold ${featuredOnly ? 'text-[#b2054c]' : 'text-[#917872]'}`}><span className={`h-4 w-4 rounded border ${featuredOnly ? 'border-[#b2054c] bg-[#b2054c]' : 'border-[#bcaea4]'}`}>{featuredOnly && <Check size={13} className="text-[#fffaf0]" />}</span> Featured only</button><label className="flex items-center gap-2 text-xs text-[#917872]">Sort by <select data-testid="select-shop-sort" value={sort} onChange={e => setSort(e.target.value)} className="bg-transparent font-bold text-[#4d092b] outline-none"><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select><ChevronDown size={13} /></label></div>
    <div className="mt-8">{productsQuery.isLoading ? <LoadingGrid /> : productsQuery.isError ? <DataMessage title="We lost the thread." body="Products aren't loading right now, but your cart is safe." onRetry={() => productsQuery.refetch()} /> : products.length ? <div className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 lg:grid-cols-4">{products.map((product: Product, i) => <ProductCard product={product} index={i} key={product.id} />)}</div> : <DataMessage title="No matches, yet." body="Try a wider search or browse another shelf." />}</div>
  </main></Shell>;
}

function ProductPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const productQuery = useGetProduct(id, { query: { enabled: !!id, queryKey: getGetProductQueryKey(id) } });
  const { addToCart, favorites, toggleFavorite } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [added, setAdded] = useState(false);
  const product = productQuery.data;
  if (productQuery.isLoading) return <Shell><main className="mx-auto max-w-[1400px] px-5 py-12"><div className="grid animate-pulse gap-10 md:grid-cols-2"><div className="aspect-square rounded-3xl bg-[#e8e4d8]" /><div><div className="h-10 w-2/3 rounded bg-[#e8e4d8]" /><div className="mt-6 h-5 w-1/3 rounded bg-[#e8e4d8]" /></div></div></main></Shell>;
  if (productQuery.isError || !product) return <Shell><main className="mx-auto max-w-[700px] px-5 py-20"><DataMessage title="That find has moved on." body="We couldn't find this product. The rest of the bazaar is still here." onRetry={() => productQuery.refetch()} /></main></Shell>;
  const favorite = favorites.includes(product.id);
  const add = () => { addToCart(product, quantity); setAdded(true); window.setTimeout(() => setAdded(false), 1600); };
  return <Shell><main className="mx-auto max-w-[1400px] px-5 py-8 lg:px-8 lg:py-12"><Link href="/shop" data-testid="link-back-shop" className="mb-8 inline-flex items-center gap-2 text-xs font-bold text-[#917872] hover:text-[#b2054c]"><ArrowLeft size={15} /> Back to shop</Link><div className="grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:gap-20"><div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-[#e9e4d8]"><ProductImage product={product} /><span className="absolute bottom-5 left-5 rounded-full bg-[#f7f4ed]/85 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[.13em] text-[#4d092b]">Bazaar pick</span></div><div className="flex flex-col justify-center"><div className="flex items-center justify-between"><p className="font-mono text-[10px] uppercase tracking-[.2em] text-[#b2054c]">{product.category}</p><button data-testid="button-product-favorite" onClick={() => toggleFavorite(product.id)} className={`flex h-10 w-10 items-center justify-center rounded-full border ${favorite ? 'border-[#d10056] bg-[#d10056] text-[#fffaf0]' : 'border-[#d8cfc1] text-[#4d092b]'}`}><Heart size={18} fill={favorite ? 'currentColor' : 'none'} /></button></div><h1 data-testid="text-product-title" className="mt-4 max-w-xl font-display text-5xl font-bold leading-[.92] tracking-[-.07em] text-[#4d092b] md:text-7xl">{product.name}</h1><div className="mt-6 flex items-center gap-4"><span data-testid="text-product-price" className="font-mono text-xl font-medium text-[#4d092b]">{money(product.price)}</span>{product.compareAtPrice && <span className="font-mono text-sm text-[#a28d84] line-through">{money(product.compareAtPrice)}</span>}<span className="flex items-center gap-1 text-xs text-[#917872]"><Star size={13} fill="#ffb900" strokeWidth={1} className="text-[#ffb900]" /> {product.rating} · {product.reviews} reviews</span></div><p className="mt-7 max-w-lg text-sm leading-7 text-[#725a57]">{product.description}</p>{product.sizes?.length > 0 && <div className="mt-8"><div className="mb-3 flex justify-between"><span className="font-mono text-[10px] uppercase tracking-[.16em] text-[#4d092b]">Select size</span><button data-testid="button-size-guide" onClick={() => alert('Our size guide: true to size, with a relaxed fit.')} className="text-xs font-bold text-[#b2054c]">Size guide</button></div><div className="flex flex-wrap gap-2">{product.sizes.map(size => <button key={size} data-testid={`button-size-${size}`} onClick={() => setSelectedSize(size)} className={`min-w-12 rounded-full border px-4 py-2.5 text-xs font-bold ${selectedSize === size ? 'border-[#4d092b] bg-[#4d092b] text-[#fffaf0]' : 'border-[#d8cfc1] text-[#6e504f]'}`}>{size}</button>)}</div></div>}<div className="mt-8 flex gap-3"><div className="flex items-center rounded-full border border-[#d8cfc1] bg-[#fbfaf6]"><button data-testid="button-product-decrease" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 text-[#4d092b]"><Minus size={15} /></button><span data-testid="text-product-quantity" className="w-7 text-center font-mono text-xs">{quantity}</span><button data-testid="button-product-increase" onClick={() => setQuantity(quantity + 1)} className="p-3 text-[#4d092b]"><Plus size={15} /></button></div><button data-testid="button-product-add" onClick={add} className={`flex flex-1 items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold ${added ? 'bg-[#7ec151] text-[#4d092b]' : 'bg-[#b2054c] text-[#fffaf0]'}`}>{added ? <><Check size={17} /> Added to bag</> : <>Add to bag <ShoppingBag size={17} /></>}</button></div><div className="mt-8 grid grid-cols-3 gap-2 border-t border-[#e5ded2] pt-6 text-center text-[10px] uppercase tracking-[.1em] text-[#917872]"><div><Truck className="mx-auto mb-2 text-[#007dcc]" size={18} />Fast dispatch</div><div><Package className="mx-auto mb-2 text-[#d10056]" size={18} />Easy returns</div><div><Tag className="mx-auto mb-2 text-[#7ec151]" size={18} />Good value</div></div></div></div></main></Shell>;
}

function CartPage() {
  const { cart, cartCount, cartTotal, setQuantity, removeFromCart } = useCart();
  if (!cart.length) return <Shell><main className="mx-auto max-w-[900px] px-5 py-16 text-center lg:py-24"><div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#ffb900] text-[#4d092b]"><ShoppingBag size={31} /></div><h1 className="mt-7 font-display text-5xl font-bold tracking-[-.07em] text-[#4d092b]">Your bag is taking a walk.</h1><p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-[#917872]">There’s nothing in it yet. Go find something that feels like you.</p><Link href="/shop" data-testid="link-empty-cart-shop" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#b2054c] px-6 py-3.5 text-sm font-bold text-[#fffaf0]">Start browsing <ArrowRight size={16} /></Link></main></Shell>;
  return <Shell><main className="mx-auto max-w-[1200px] px-5 py-10 lg:px-8 lg:py-14"><div className="flex items-end justify-between border-b border-[#d8cfc1] pb-8"><div><p className="font-mono text-[10px] uppercase tracking-[.2em] text-[#b2054c]">Your picks</p><h1 className="mt-2 font-display text-5xl font-bold tracking-[-.07em] text-[#4d092b]">Your bag<span className="text-[#d10056]">.</span></h1></div><span className="font-mono text-xs text-[#917872]">{cartCount} {cartCount === 1 ? 'item' : 'items'}</span></div><div className="mt-9 grid gap-10 lg:grid-cols-[1fr_360px]"><div className="divide-y divide-[#e5ded2]">{cart.map(line => <div data-testid={`row-cart-${line.product.id}`} key={line.product.id} className="flex gap-4 py-5 first:pt-0"><div className="h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-[#e9e4d8]"><ProductImage product={line.product} /></div><div className="min-w-0 flex-1"><div className="flex justify-between gap-3"><div><h2 className="font-display text-lg font-bold text-[#4d092b]">{line.product.name}</h2><p className="mt-1 text-xs text-[#917872]">{line.product.category}</p></div><p className="font-mono text-sm text-[#4d092b]">{money(line.product.price * line.quantity)}</p></div><div className="mt-6 flex items-center justify-between"><div className="flex items-center rounded-full border border-[#d8cfc1] bg-[#fbfaf6]"><button data-testid={`button-cart-decrease-${line.product.id}`} onClick={() => setQuantity(line.product.id, line.quantity - 1)} className="p-2.5 text-[#4d092b]"><Minus size={14} /></button><span data-testid={`text-cart-quantity-${line.product.id}`} className="w-7 text-center font-mono text-xs">{line.quantity}</span><button data-testid={`button-cart-increase-${line.product.id}`} onClick={() => setQuantity(line.product.id, line.quantity + 1)} className="p-2.5 text-[#4d092b]"><Plus size={14} /></button></div><button data-testid={`button-cart-remove-${line.product.id}`} onClick={() => removeFromCart(line.product.id)} className="flex items-center gap-1 text-xs font-bold text-[#917872] hover:text-[#d10056]"><Trash2 size={14} /> Remove</button></div></div></div>)}</div><aside className="h-fit rounded-3xl bg-[#ffb900] p-6 md:p-8"><p className="font-mono text-[10px] uppercase tracking-[.2em] text-[#4d092b]/65">Order summary</p><div className="mt-6 flex justify-between text-sm text-[#4d092b]"><span>Subtotal</span><span className="font-mono">{money(cartTotal)}</span></div><div className="mt-3 flex justify-between text-sm text-[#4d092b]"><span>Delivery</span><span className="font-mono">{cartTotal >= 75 ? 'Free' : money(6)}</span></div><div className="my-6 border-t border-[#4d092b]/20" /><div className="flex justify-between text-lg font-bold text-[#4d092b]"><span>Total</span><span data-testid="text-cart-total" className="font-mono">{money(cartTotal + (cartTotal >= 75 ? 0 : 6))}</span></div><Link href="/checkout" data-testid="link-checkout" className="mt-7 flex items-center justify-center gap-2 rounded-full bg-[#b2054c] py-3.5 text-sm font-bold text-[#fffaf0]">Checkout <ArrowRight size={17} /></Link><p className="mt-4 text-center text-[10px] text-[#4d092b]/65">Free delivery on orders over $75</p></aside></div></main></Shell>;
}

function CheckoutPage() {
  const { cart, cartTotal } = useCart();
  const [, setLocation] = useLocation();
  const createOrder = useCreateOrder();
  const [form, setForm] = useState({ customerName: '', email: '', address: '', city: '', phone: '' });
  const [submitted, setSubmitted] = useState(false);
  const total = cartTotal + (cartTotal >= 75 ? 0 : 6);
  const update = (field: keyof typeof form) => (event: ChangeEvent<HTMLInputElement>) => setForm(current => ({ ...current, [field]: event.target.value }));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.customerName || !form.email || !form.address || !form.city || !cart.length) return;
    const data: OrderInput = { ...form, items: cart.map(line => ({ productId: line.product.id, quantity: line.quantity, price: line.product.price })), total };
    setSubmitted(true);
    createOrder.mutate({ data }, { onSuccess: order => { sessionStorage.setItem('bazaar-last-order', JSON.stringify(order)); setLocation('/order-success'); }, onError: () => setSubmitted(false) });
  };
  if (!cart.length) return <Shell><main className="mx-auto max-w-[700px] px-5 py-20"><DataMessage title="Your checkout is waiting." body="Add something to your bag before you check out." /></main></Shell>;
  return <Shell><main className="mx-auto max-w-[1100px] px-5 py-10 lg:px-8 lg:py-14"><Link href="/cart" data-testid="link-back-cart" className="mb-8 inline-flex items-center gap-2 text-xs font-bold text-[#917872]"><ArrowLeft size={15} /> Back to bag</Link><div className="grid gap-12 lg:grid-cols-[1fr_360px]"><div><p className="font-mono text-[10px] uppercase tracking-[.2em] text-[#b2054c]">Nearly there</p><h1 className="mt-2 font-display text-5xl font-bold tracking-[-.07em] text-[#4d092b]">Make it yours<span className="text-[#d10056]">.</span></h1><p className="mt-3 text-sm text-[#917872]">Where should we send the good stuff?</p><form onSubmit={submit} className="mt-9 space-y-5"><div><label className="mb-2 block text-xs font-bold text-[#4d092b]">Name</label><input required data-testid="input-checkout-name" value={form.customerName} onChange={update('customerName')} className="h-12 w-full rounded-xl border border-[#d8cfc1] bg-[#fbfaf6] px-4 text-sm outline-none focus:border-[#b2054c]" placeholder="Your full name" /></div><div className="grid gap-5 md:grid-cols-2"><div><label className="mb-2 block text-xs font-bold text-[#4d092b]">Email</label><input required type="email" data-testid="input-checkout-email" value={form.email} onChange={update('email')} className="h-12 w-full rounded-xl border border-[#d8cfc1] bg-[#fbfaf6] px-4 text-sm outline-none focus:border-[#b2054c]" placeholder="you@example.com" /></div><div><label className="mb-2 block text-xs font-bold text-[#4d092b]">Phone <span className="font-normal text-[#917872]">optional</span></label><input data-testid="input-checkout-phone" value={form.phone} onChange={update('phone')} className="h-12 w-full rounded-xl border border-[#d8cfc1] bg-[#fbfaf6] px-4 text-sm outline-none focus:border-[#b2054c]" placeholder="+1 555 000 0000" /></div></div><div><label className="mb-2 block text-xs font-bold text-[#4d092b]">Address</label><input required data-testid="input-checkout-address" value={form.address} onChange={update('address')} className="h-12 w-full rounded-xl border border-[#d8cfc1] bg-[#fbfaf6] px-4 text-sm outline-none focus:border-[#b2054c]" placeholder="Street and number" /></div><div><label className="mb-2 block text-xs font-bold text-[#4d092b]">City</label><input required data-testid="input-checkout-city" value={form.city} onChange={update('city')} className="h-12 w-full rounded-xl border border-[#d8cfc1] bg-[#fbfaf6] px-4 text-sm outline-none focus:border-[#b2054c]" placeholder="Your city" /></div><button data-testid="button-place-order" disabled={createOrder.isPending || submitted} className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-[#b2054c] py-4 text-sm font-bold text-[#fffaf0] disabled:opacity-60">{createOrder.isPending || submitted ? 'Placing your order…' : <>Place order <ArrowRight size={17} /></>}</button>{createOrder.isError && <p data-testid="status-checkout-error" className="text-center text-sm font-medium text-[#d10056]">Something went wrong. Please try again.</p>}</form></div><aside className="h-fit rounded-3xl bg-[#007dcc] p-6 text-[#fffaf0] md:p-8"><p className="font-mono text-[10px] uppercase tracking-[.2em] text-[#bde9ff]">In your bag</p><div className="mt-6 space-y-4">{cart.map(line => <div key={line.product.id} className="flex justify-between gap-4 text-sm"><span className="min-w-0 truncate">{line.quantity} × {line.product.name}</span><span className="font-mono">{money(line.product.price * line.quantity)}</span></div>)}</div><div className="my-6 border-t border-[#fffaf0]/25" /><div className="flex justify-between text-sm text-[#cceeff]"><span>Delivery</span><span>{cartTotal >= 75 ? 'Free' : money(6)}</span></div><div className="mt-3 flex justify-between text-lg font-bold"><span>Total</span><span data-testid="text-checkout-total" className="font-mono">{money(total)}</span></div><div className="mt-8 rounded-2xl bg-[#fffaf0]/10 p-4 text-xs leading-5 text-[#d8effb]"><Truck size={17} className="mb-2 text-[#ffb900]" /> Ships in 3–5 business days. Returns are easy for 30 days.</div></aside></div></main></Shell>;
}

function OrderSuccessPage() {
  const [location, setLocation] = useLocation();
  const [order] = useState(() => { try { return JSON.parse(sessionStorage.getItem('bazaar-last-order') || 'null') as { id?: string; total?: number; customerName?: string } | null; } catch { return null; } });
  return <Shell><main className="mx-auto max-w-[760px] px-5 py-16 text-center lg:py-24"><div className="mx-auto flex h-24 w-24 rotate-[-6deg] items-center justify-center rounded-[2rem] bg-[#7ec151] text-[#4d092b]"><Check size={42} strokeWidth={3} /></div><p className="mt-10 font-mono text-[10px] uppercase tracking-[.2em] text-[#b2054c]">Order confirmed</p><h1 data-testid="text-order-success" className="mt-3 font-display text-6xl font-bold leading-[.88] tracking-[-.08em] text-[#4d092b]">Good call,<br /><span className="text-[#d10056]">{order?.customerName?.split(' ')[0] || 'friend'}.</span></h1><p className="mx-auto mt-7 max-w-md text-base leading-7 text-[#725a57]">Your Bazaar order is on its way to becoming a real-life good thing. We’ll send a note to your inbox when it ships.</p><div className="mx-auto mt-9 max-w-sm rounded-2xl border border-[#d8cfc1] bg-[#fbfaf6] p-5 text-left"><div className="flex justify-between text-xs text-[#917872]"><span>Order number</span><span data-testid="text-order-id" className="font-mono font-bold text-[#4d092b]">{order?.id || 'BAZ-THANKS'}</span></div>{order?.total && <div className="mt-3 flex justify-between text-xs text-[#917872]"><span>Charged</span><span className="font-mono font-bold text-[#4d092b]">{money(order.total)}</span></div>}</div><div className="mt-9 flex justify-center gap-3"><Link href="/shop" data-testid="link-success-shop" className="inline-flex items-center gap-2 rounded-full bg-[#b2054c] px-6 py-3.5 text-sm font-bold text-[#fffaf0]">Keep browsing <ArrowRight size={16} /></Link><button data-testid="button-success-home" onClick={() => setLocation('/')} className="rounded-full border border-[#d8cfc1] px-6 py-3.5 text-sm font-bold text-[#4d092b]">Home</button></div></main></Shell>;
}

function AdminPage() {
  const summaryQuery = useGetDashboardSummary({ query: { queryKey: getGetDashboardSummaryQueryKey() } });
  const productsQuery = useListProducts({}, { query: { queryKey: getListProductsQueryKey({}) } });
  const summary = summaryQuery.data;
  const products = productsQuery.data || [];
  return <Shell><main className="mx-auto max-w-[1400px] px-5 py-10 lg:px-8 lg:py-14"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="font-mono text-[10px] uppercase tracking-[.2em] text-[#007dcc]">Bazaar / back office</p><h1 className="mt-2 font-display text-5xl font-bold tracking-[-.07em] text-[#4d092b]">Store pulse<span className="text-[#d10056]">.</span></h1></div><span className="rounded-full bg-[#7ec151]/30 px-4 py-2 font-mono text-[10px] uppercase tracking-[.14em] text-[#285d28]">Live overview</span></div>{summaryQuery.isError ? <div className="mt-8"><DataMessage title="Dashboard is catching up." body="We couldn't load the store summary." onRetry={() => summaryQuery.refetch()} /></div> : <><div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[['Products', summary?.totalProducts ?? '—', '#7ec151'], ['Orders', summary?.totalOrders ?? '—', '#ffb900'], ['Revenue', summary ? money(summary.totalRevenue) : '—', '#007dcc'], ['Conversion', summary ? `${summary.conversionRate}%` : '—', '#d10056']].map(([label, value, color]) => <div data-testid={`stat-admin-${String(label).toLowerCase()}`} key={label} className="rounded-2xl border border-[#e5ded2] bg-[#fbfaf6] p-5"><div className="mb-10 h-3 w-3 rounded-full" style={{ background: color as string }} /><p className="font-mono text-[10px] uppercase tracking-[.16em] text-[#917872]">{label}</p><p className="mt-2 font-display text-3xl font-bold tracking-[-.05em] text-[#4d092b]">{value}</p></div>)}</div><div className="mt-12 grid gap-8 lg:grid-cols-[1.2fr_.8fr]"><section className="rounded-3xl border border-[#e5ded2] bg-[#fbfaf6] p-6"><div className="flex items-center justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.16em] text-[#b2054c]">Catalog health</p><h2 className="mt-2 font-display text-2xl font-bold text-[#4d092b]">Product shelf</h2></div><Link href="/shop" data-testid="link-admin-catalog" className="text-xs font-bold text-[#b2054c]">View shop <ArrowRight size={14} className="ml-1 inline" /></Link></div>{productsQuery.isLoading ? <div className="mt-6 space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-14 animate-pulse rounded-xl bg-[#e8e4d8]" />)}</div> : <div className="mt-6 divide-y divide-[#e5ded2]">{products.slice(0, 6).map(product => <div data-testid={`row-admin-product-${product.id}`} key={product.id} className="flex items-center gap-3 py-3"><div className="h-11 w-10 overflow-hidden rounded-lg bg-[#e9e4d8]"><ProductImage product={product} /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-[#4d092b]">{product.name}</p><p className="text-xs text-[#917872]">{product.category}</p></div><span className="font-mono text-xs text-[#4d092b]">{money(product.price)}</span><span className="rounded-full bg-[#7ec151]/25 px-2 py-1 font-mono text-[9px] uppercase text-[#285d28]">active</span></div>)}</div>}</section><section className="rounded-3xl bg-[#4d092b] p-6 text-[#f7f4ed]"><p className="font-mono text-[10px] uppercase tracking-[.16em] text-[#ffb900]">Operator notes</p><h2 className="mt-2 font-display text-2xl font-bold">Keep the shelves feeling fresh.</h2><div className="mt-8 space-y-4 text-sm leading-6 text-[#dfcbd0]"><p className="border-l-2 border-[#7ec151] pl-4">Your featured edit is what shoppers see first. Keep it tight and surprising.</p><p className="border-l-2 border-[#007dcc] pl-4">A clear product photo and honest description does more than a dozen badges.</p><p className="border-l-2 border-[#ffb900] pl-4">Orders and revenue are synced from the live storefront.</p></div><Link href="/" data-testid="link-admin-storefront" className="mt-9 inline-flex items-center gap-2 rounded-full bg-[#ffb900] px-5 py-3 text-sm font-bold text-[#4d092b]">See storefront <ArrowRight size={16} /></Link></section></div></>}</main></Shell>;
}

function AuthPage({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const isSignIn = mode === 'sign-in';
  return <main className="bazaar-grain flex min-h-[100dvh] items-center justify-center bg-[#f7f4ed] px-5 py-12">
    <div className="w-full max-w-[520px]">
      <Link href="/" className="mx-auto mb-8 flex w-fit items-center gap-2">
        <span className="flex h-9 w-9 rotate-[-8deg] items-center justify-center rounded-[11px] bg-[#b2054c] text-[#f7f4ed]"><Sparkles size={19} /></span>
        <span className="font-display text-2xl font-bold tracking-[-.06em] text-[#4d092b]">bazaar<span className="text-[#d10056]">.</span></span>
      </Link>
      <div className="mb-5 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[.2em] text-[#b2054c]">{isSignIn ? 'Welcome back' : 'Join the bazaar'}</p>
        <p className="mt-2 text-sm text-[#917872]">{isSignIn ? 'Your good things are waiting.' : 'Create an account for easier checkout and order updates.'}</p>
      </div>
      {isSignIn ? <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
        fallbackRedirectUrl={`${basePath}/`}
        appearance={clerkAppearance}
      /> : <SignUp
        routing="path"
        path={`${basePath}/sign-up`}
        signInUrl={`${basePath}/sign-in`}
        fallbackRedirectUrl={`${basePath}/`}
        appearance={clerkAppearance}
      />}
    </div>
  </main>;
}

function AccountPage() {
  const { user } = useUser();
  const { signOut } = useClerk();
  return <Shell><main className="mx-auto max-w-[900px] px-5 py-12 lg:px-8 lg:py-16">
    <Show when="signed-in">
      <div className="rounded-[2rem] bg-[#7ec151] p-8 md:p-12">
        <p className="font-mono text-[10px] uppercase tracking-[.2em] text-[#285d28]">Your Bazaar</p>
        <h1 className="mt-3 font-display text-5xl font-bold tracking-[-.07em] text-[#4d092b] md:text-7xl">Hello, {user?.firstName || 'friend'}<span className="text-[#d10056]">.</span></h1>
        <p className="mt-5 max-w-md text-sm leading-6 text-[#285d28]">Your account keeps checkout simple and makes it easier to stay close to the good stuff.</p>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-[#e5ded2] bg-[#fbfaf6] p-6"><p className="font-mono text-[10px] uppercase tracking-[.16em] text-[#b2054c]">Account details</p><p className="mt-5 font-bold text-[#4d092b]">{user?.fullName || 'Bazaar shopper'}</p><p className="mt-1 text-sm text-[#917872]">{user?.primaryEmailAddress?.emailAddress}</p></div>
        <div className="rounded-3xl bg-[#ffb900] p-6"><p className="font-mono text-[10px] uppercase tracking-[.16em] text-[#4d092b]/65">Next move</p><h2 className="mt-3 font-display text-2xl font-bold text-[#4d092b]">Find a little wow.</h2><Link href="/shop" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#b2054c] px-5 py-3 text-sm font-bold text-[#fffaf0]">Browse the shop <ArrowRight size={15} /></Link></div>
      </div>
      <button onClick={() => signOut({ redirectUrl: basePath || '/' })} className="mt-7 text-sm font-bold text-[#b2054c]">Sign out</button>
    </Show>
  </main></Shell>;
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return <Shell><main className="mx-auto max-w-[700px] px-5 py-24 text-center"><div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[#d8cfc1] border-t-[#b2054c]" /></main></Shell>;
  if (!isSignedIn) return <Redirect to="/sign-in" />;
  return <>{children}</>;
}

function AdminRoute() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  if (!isLoaded) return <Shell><main className="mx-auto max-w-[700px] px-5 py-24 text-center"><div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[#d8cfc1] border-t-[#b2054c]" /></main></Shell>;
  if (!isSignedIn) return <Redirect to="/sign-in" />;
  if (user?.publicMetadata?.role !== 'admin') return <Shell><main className="mx-auto max-w-[700px] px-5 py-24 text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#ffb900] text-2xl text-[#4d092b]">!</div><h1 className="mt-7 font-display text-5xl font-bold tracking-[-.07em] text-[#4d092b]">Not your shelf.</h1><p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-[#917872]">The dashboard is reserved for Bazaar admins.</p><Link href="/" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#b2054c] px-6 py-3.5 text-sm font-bold text-[#fffaf0]">Back to storefront <ArrowRight size={16} /></Link></main></Shell>;
  return <AdminPage />;
}

function HomeRedirect() {
  return <HomePage />;
}

function GuestPage({ title, body }: { title: string; body: string }) {
  return <Shell><main className="mx-auto max-w-[700px] px-5 py-24 text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#ffb900] text-2xl text-[#4d092b]">!</div><h1 className="mt-7 font-display text-5xl font-bold tracking-[-.07em] text-[#4d092b]">{title}</h1><p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-[#917872]">{body}</p><Link href="/shop" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#b2054c] px-6 py-3.5 text-sm font-bold text-[#fffaf0]">Browse the shop <ArrowRight size={16} /></Link></main></Shell>;
}

function GuestRouter() {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}><Switch>
    <Route path="/" component={HomePage} />
    <Route path="/shop" component={ShopPage} />
    <Route path="/product/:id" component={ProductPage} />
    <Route path="/cart" component={CartPage} />
    <Route path="/checkout" component={CheckoutPage} />
    <Route path="/order-success" component={OrderSuccessPage} />
    <Route path="/sign-in/*?"><GuestPage title="Guest checkout is ready." body="You can browse the Bazaar without an account. Sign-in can be enabled later by adding your Clerk key." /></Route>
    <Route path="/sign-up/*?"><GuestPage title="Create an account later." body="The storefront is available now. Add your Clerk configuration when you want customer accounts." /></Route>
    <Route path="/account"><GuestPage title="Your account is optional." body="Browse and test the storefront first, then enable accounts when your Clerk credentials are configured." /></Route>
    <Route path="/dashboard"><GuestPage title="Dashboard needs an admin account." body="The Laravel API is ready; connect authentication before enabling the admin dashboard." /></Route>
    <Route path="/admin"><GuestPage title="Dashboard needs an admin account." body="The Laravel API is ready; connect authentication before enabling the admin dashboard." /></Route>
    <Route component={NotFound} />
  </Switch></ErrorBoundary>;
}

function Router() {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}><Switch>
    <Route path="/" component={HomeRedirect} />
    <Route path="/shop" component={ShopPage} />
    <Route path="/product/:id" component={ProductPage} />
    <Route path="/cart" component={CartPage} />
    <Route path="/checkout">{() => <ProtectedRoute><CheckoutPage /></ProtectedRoute>}</Route>
    <Route path="/order-success" component={OrderSuccessPage} />
    <Route path="/account">{() => <ProtectedRoute><AccountPage /></ProtectedRoute>}</Route>
    <Route path="/sign-in/*?" component={() => <AuthPage mode="sign-in" />} />
    <Route path="/sign-up/*?" component={() => <AuthPage mode="sign-up" />} />
    <Route path="/dashboard" component={AdminRoute} />
    <Route path="/admin" component={AdminRoute} />
    <Route component={NotFound} />
  </Switch></ErrorBoundary>;
}

function ClerkApp() {
  const [, setLocation] = useLocation();
  return <ClerkProvider
    publishableKey={clerkPubKey}
    proxyUrl={clerkProxyUrl}
    appearance={clerkAppearance}
    signInUrl={`${basePath}/sign-in`}
    signUpUrl={`${basePath}/sign-up`}
    localization={{ signIn: { start: { title: 'Sign in to Bazaar', subtitle: 'Welcome back. Please sign in to continue.' } }, signUp: { start: { title: 'Create your Bazaar account', subtitle: 'Join us for easier checkout and order updates.' } } }}
    routerPush={(to) => setLocation(stripBase(to))}
    routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
  >
    <QueryClientProvider client={queryClient}><TooltipProvider><CartProvider><Router /></CartProvider><Toaster /></TooltipProvider></QueryClientProvider>
  </ClerkProvider>;
}

function App() {
  return <WouterRouter base={basePath}>
    {clerkPubKey ? <ClerkApp /> : <QueryClientProvider client={queryClient}><TooltipProvider><CartProvider><GuestRouter /></CartProvider><Toaster /></TooltipProvider></QueryClientProvider>}
  </WouterRouter>;
}

export default App;