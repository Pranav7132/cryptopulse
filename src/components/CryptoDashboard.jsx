import React, { useState, useEffect } from 'react';
import { Moon, Sun, Search, ArrowUpDown, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CryptoConverter from './CryptoConverter';
import logo from "./logo2.jpg";

const USER_ID = "demoUser";



const CryptoDashboard = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [cryptoData, setCryptoData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({
    key: 'market_cap_rank',
    direction: 'asc',
  });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [displayCount, setDisplayCount] = useState(10);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('prices'); // New state for tab management

  // Fetch cryptocurrency data from CoinGecko API
  const fetchCryptoData = async () => {
    try {
      setIsRefreshing(true);
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h'
      );

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setCryptoData(data);
      setFilteredData(data);
      setIsLoading(false);
      setIsRefreshing(false);
    } catch (error) {
      setError(
        'Failed to fetch data. CoinGecko API may have rate limiting in effect.'
      );
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchCryptoData();

    // Set dark mode based on user preference
    if (
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      setIsDarkMode(true);
    }
  }, []);
useEffect(() => {
  fetch("http://localhost:5000/api/watchlist/" + USER_ID)
    .then(res => res.json())
    .then(data => {
      setWatchlist(data.coins || []);
    })
    .catch(err => {
      console.error("Failed to load watchlist", err);
    });
}, []);

  // Apply dark mode class to body
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Filter cryptocurrencies based on search input
  useEffect(() => {
    const filtered = cryptoData.filter(
      (crypto) =>
        crypto.name.toLowerCase().includes(search.toLowerCase()) ||
        crypto.symbol.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredData(filtered);
  }, [search, cryptoData]);

  // Handle sort functionality
  const handleSort = (key) => {
    let direction = 'asc';

    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    setSortConfig({ key, direction });

    const sortedData = [...filteredData].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'asc' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    setFilteredData(sortedData);
  };

  // Format large numbers with commas
  const formatNumber = (num) => {
    return num.toLocaleString();
  };

  // Format currency
  const formatCurrency = (num) => {
    if (num >= 1000000000) {
      return `$${(num / 1000000000).toFixed(2)}B`;
    } else if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(2)}M`;
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(2)}K`;
    } else {
      return `$${num.toFixed(2)}`;
    }
  };

  // Format price based on value
  const formatPrice = (price) => {
    if (price >= 1000) {
      return `$${formatNumber(Math.round(price))}`;
    } else if (price >= 1) {
      return `$${price.toFixed(2)}`;
    } else {
      return `$${price.toFixed(6)}`;
    }
  };

  // Toggle dark/light mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };
  const toggleWatchlist = (coinId) => {
  let updated;

  if (watchlist.includes(coinId)) {
    updated = watchlist.filter((id) => id !== coinId);
  } else {
    updated = [...watchlist, coinId];
  }

  setWatchlist(updated);

  fetch("http://localhost:5000/api/watchlist/" + USER_ID, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ coins: updated }),
  });
};

  // Handle display count change
  const handleDisplayCountChange = (e) => {
    setDisplayCount(Number(e.target.value));
  };

  // Manual refresh function
  const handleRefresh = () => {
    fetchCryptoData();
  };

  // Tab change handler
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // ---------- NEW: Global stats for cards ----------
  const totalMarketCap = cryptoData.reduce(
    (sum, c) => sum + (c.market_cap || 0),
    0
  );

  const validChangeCoins = cryptoData.filter(
    (c) => typeof c.price_change_percentage_24h === 'number'
  );
  const avgChange24h =
    validChangeCoins.length > 0
      ? validChangeCoins.reduce(
          (sum, c) => sum + c.price_change_percentage_24h,
          0
        ) / validChangeCoins.length
      : 0;

  const topGainer = [...validChangeCoins].sort(
    (a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h
  )[0];

  const btc = cryptoData.find(
    (c) => c.symbol && c.symbol.toLowerCase() === 'btc'
  );
  const btcDominance =
    btc && totalMarketCap > 0
      ? ((btc.market_cap / totalMarketCap) * 100).toFixed(1)
      : null;

  // -------------------------------------------------

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-100 dark:bg-slate-950">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            Loading cryptocurrency data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-100 dark:bg-slate-950">
        <div className="rounded-2xl bg-white p-8 shadow-2xl shadow-slate-900/10 dark:bg-slate-900">
          <h2 className="mb-4 text-xl font-bold text-red-500">Error</h2>
          <p className="text-gray-700 dark:text-gray-300">{error}</p>
          <button
            className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            onClick={handleRefresh}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 text-slate-900 transition-colors duration-300 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center">
              <div className="mr-3">
  <img
    src={logo}
    alt="CryptoPulse Logo"
    className="h-10 w-10 rounded-xl shadow-md"
  />
</div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                  CryptoPulse
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Live market overview • Click a coin for detailed charts
                </p>
              </div>
              <button
                onClick={toggleDarkMode}
                className="ml-4 rounded-full border border-slate-200 bg-slate-50 p-2 text-gray-500 shadow-sm hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>

            <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search cryptocurrencies..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-800 shadow-sm outline-none ring-blue-500/0 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-200"
                />
              </div>

              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70`}
              >
                <RefreshCw
                  size={16}
                  className={`mr-1 ${isRefreshing ? 'animate-spin' : ''}`}
                />
                {isRefreshing ? 'Refreshing…' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mt-6 border-b border-gray-200 dark:border-gray-700">
  <nav className="-mb-px flex items-center space-x-6 text-sm">
    {/* Price Tracker */}
    <button
      onClick={() => setActiveTab("prices")}
      className={`pb-3 px-1 border-b-2 font-medium transition ${
        activeTab === "prices"
          ? "border-blue-500 text-blue-600 dark:text-blue-400"
          : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
      }`}
    >
      Price Tracker
    </button>

    {/* Currency Converter */}
    <button
      onClick={() => setActiveTab("converter")}
      className={`pb-3 px-1 border-b-2 font-medium transition ${
        activeTab === "converter"
          ? "border-blue-500 text-blue-600 dark:text-blue-400"
          : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
      }`}
    >
      Currency Converter
    </button>

    {/* Watchlist */}
    <button
      onClick={() => navigate("/watchlist")}
      className="pb-3 px-1 border-b-2 border-transparent font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition"
    >
      ⭐ Watchlist
    </button>
  </nav>
</div>


          {/* NEW: Summary cards */}
          {activeTab === 'prices' && (
            <>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Total Market Cap
                  </p>
                  <p className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-50">
                    {formatCurrency(totalMarketCap)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Across top {cryptoData.length} coins
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Avg 24h Change
                  </p>
                  <p
                    className={`mt-2 text-xl font-semibold ${
                      avgChange24h >= 0
                        ? 'text-emerald-500'
                        : 'text-rose-500'
                    }`}
                  >
                    {avgChange24h >= 0 ? '+' : ''}
                    {avgChange24h.toFixed(2)}%
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Mean of all tracked coins
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Top Gainer (24h)
                  </p>
                  {topGainer ? (
                    <>
                      <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-50">
                        {topGainer.name}{' '}
                        <span className="text-xs uppercase text-slate-500 dark:text-slate-400">
                          ({topGainer.symbol})
                        </span>
                      </p>
                      <p className="mt-1 text-sm font-semibold text-emerald-500">
                        +{topGainer.price_change_percentage_24h.toFixed(2)}%
                      </p>
                    </>
                  ) : (
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                      Not available
                    </p>
                  )}
                  {btcDominance && (
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      BTC Dominance: {btcDominance}%
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {Math.min(displayCount, filteredData.length)} of{' '}
                  {filteredData.length} cryptocurrencies
                </p>

                <div className="flex items-center gap-3">
                  <label
                    htmlFor="displayCount"
                    className="text-sm text-gray-600 dark:text-gray-400"
                  >
                    Display:
                  </label>
                  <select
                    id="displayCount"
                    value={displayCount}
                    onChange={handleDisplayCountChange}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>
            </>
          )}
        </div>
      </header>

      <main className="container mx-auto p-4">
        {activeTab === 'prices' ? (
          <div className="overflow-x-auto rounded-2xl bg-white shadow-lg shadow-slate-900/5 dark:bg-slate-900 dark:shadow-none">
            <table className="w-full table-auto">
  <thead>
    <tr className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:bg-gray-800 dark:text-gray-300">
      <th className="px-4 py-3">
        <button
          className="flex items-center"
          onClick={() => handleSort('market_cap_rank')}
        >
          #
          <ArrowUpDown size={14} className="ml-1" />
        </button>
      </th>

      <th className="px-4 py-3">Coin</th>

      <th className="px-4 py-3">
        <button
          className="flex items-center"
          onClick={() => handleSort('current_price')}
        >
          Price
          <ArrowUpDown size={14} className="ml-1" />
        </button>
      </th>

      <th className="px-4 py-3">
        <button
          className="flex items-center"
          onClick={() => handleSort('price_change_percentage_24h')}
        >
          24h %
          <ArrowUpDown size={14} className="ml-1" />
        </button>
      </th>

      <th className="px-4 py-3">
        <button
          className="flex items-center"
          onClick={() => handleSort('market_cap')}
        >
          Market Cap
          <ArrowUpDown size={14} className="ml-1" />
        </button>
      </th>

      <th className="px-4 py-3">
        <button
          className="flex items-center"
          onClick={() => handleSort('total_volume')}
        >
          Volume (24h)
          <ArrowUpDown size={14} className="ml-1" />
        </button>
      </th>

      {/* ⭐ NEW COLUMN HEADER */}
      <th className="px-4 py-3 text-center">★</th>
    </tr>
  </thead>

  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
    {filteredData.slice(0, displayCount).map((crypto) => (
      <tr
        key={crypto.id}
        onClick={() =>
          navigate(`/crypto/${crypto.id}`, { state: { crypto } })
        }
        className="cursor-pointer bg-white transition hover:bg-blue-50/60 dark:bg-slate-900 dark:hover:bg-slate-800"
      >
        <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
          {crypto.market_cap_rank}
        </td>

        <td className="whitespace-nowrap px-4 py-4">
          <div className="flex items-center">
            <div className="h-8 w-8 flex-shrink-0">
              <img
                src={crypto.image}
                alt={crypto.name}
                className="h-8 w-8 rounded-full"
              />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {crypto.name}
              </div>
              <div className="text-xs uppercase text-gray-500 dark:text-gray-400">
                {crypto.symbol}
              </div>
            </div>
          </div>
        </td>

        <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
          {formatPrice(crypto.current_price)}
        </td>

        <td
          className={`whitespace-nowrap px-4 py-4 text-sm font-medium ${
            crypto.price_change_percentage_24h > 0
              ? 'text-emerald-500'
              : 'text-rose-500'
          }`}
        >
          {crypto.price_change_percentage_24h > 0 ? '+' : ''}
          {crypto.price_change_percentage_24h.toFixed(2)}%
        </td>

        <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
          {formatCurrency(crypto.market_cap)}
        </td>

        <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
          {formatCurrency(crypto.total_volume)}
        </td>

        {/* ⭐ NEW WATCHLIST CELL */}
        <td className="px-4 py-4 text-center">
          <button
            onClick={(e) => {
              e.stopPropagation(); // prevents row navigation
              toggleWatchlist(crypto.id);
            }}
            className={`text-lg transition ${
              watchlist.includes(crypto.id)
                ? 'text-yellow-400'
                : 'text-gray-400 hover:text-yellow-300'
            }`}
            title="Add to watchlist"
          >
            ★
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>

          </div>
        ) : (
          <CryptoConverter cryptoData={cryptoData} />
        )}
      </main>

      <footer className="mt-4 border-t border-slate-200 bg-white/80 py-4 text-center text-xs text-gray-600 shadow-inner dark:border-slate-800 dark:bg-slate-900/80 dark:text-gray-400">
        <p>Data provided by CoinGecko API • Built with React</p>
      </footer>
    </div>
  );
};

export default CryptoDashboard;
