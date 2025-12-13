import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const CryptoDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const passedCrypto = location.state?.crypto || null;
  const [crypto, setCrypto] = useState(passedCrypto);
  const [chartData, setChartData] = useState([]);
  const [days, setDays] = useState(30);
  const [isLoading, setIsLoading] = useState(true);
  const [isMetaLoading, setIsMetaLoading] = useState(!passedCrypto);
  const [error, setError] = useState(null);

  // Fetch fallback coin data if page refreshed or opened directly
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        setIsMetaLoading(true);
        const res = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${id}&price_change_percentage=24h`
        );
        if (!res.ok) throw new Error('Failed to fetch coin meta');
        const data = await res.json();
        if (data && data[0]) setCrypto(data[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setIsMetaLoading(false);
      }
    };

    if (!passedCrypto) {
      fetchMeta();
    } else {
      setIsMetaLoading(false);
    }
  }, [id, passedCrypto]);

  const fetchHistory = async (rangeDays) => {
  try {
    setIsLoading(true);
    setError(null);

    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${rangeDays}`
    );

    // 🔑 Handle rate limit safely
    if (res.status === 429) {
      console.warn("Rate limited by CoinGecko");
      setIsLoading(false);
      return;
    }

    if (!res.ok) {
      throw new Error("Failed to fetch historical data");
    }

    const data = await res.json();

    if (!data.prices || data.prices.length === 0) {
      setChartData([]);
      setIsLoading(false);
      return;
    }

    const formatted = data.prices.map(([timestamp, price]) => ({
      date: new Date(timestamp).toLocaleDateString(),
      price: Number(price),
    }));

    setChartData(formatted);
    setIsLoading(false);
  } catch (err) {
    console.error(err);
    setError("Unable to load price history at the moment.");
    setIsLoading(false);
  }
};


  useEffect(() => {
    fetchHistory(days);
  }, [id, days]);

  const handleRangeChange = (value) => {
    setDays(value);
  };

  const formatCurrency = (num) => {
    if (num == null) return '—';
    if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(2)}B`;
    if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
    if (num >= 1_000) return `$${(num / 1_000).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const formatPrice = (price) => {
    if (price == null) return '—';
    if (price >= 1000) return `$${Math.round(price).toLocaleString()}`;
    if (price >= 1) return `$${price.toFixed(2)}`;
    return `$${price.toFixed(6)}`;
  };

  if (isLoading && !chartData.length) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-100 dark:bg-slate-950">
        <p className="text-lg text-gray-700 dark:text-gray-300">
          Loading {id} price history...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-100 dark:bg-slate-950">
        <div className="rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
          <h2 className="mb-2 text-xl font-semibold text-red-500">Error</h2>
          <p className="mb-4 text-gray-700 dark:text-gray-300">{error}</p>
          <button
            onClick={() => fetchHistory(days)}
            className="mr-2 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Retry
          </button>
          <button
            onClick={() => navigate(-1)}
            className="rounded-md bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 p-4 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-5xl">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          ← Back to Dashboard
        </button>

        {/* Hero section */}
        <div className="mb-6 rounded-3xl border border-slate-200 bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 p-5 text-white shadow-xl dark:border-slate-800">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center">
              {crypto && (
                <img
                  src={crypto.image}
                  alt={crypto.name}
                  className="mr-4 h-12 w-12 rounded-full border border-white/20 bg-white/5"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold">
                  {crypto?.name || id.toUpperCase()}
                </h1>
                <p className="text-xs uppercase text-blue-100">
                  {crypto?.symbol}
                </p>
                {crypto && (
                  <p className="mt-2 text-sm text-blue-100">
                    Current Price:{' '}
                    <span className="text-lg font-semibold">
                      {formatPrice(crypto.current_price)}
                    </span>
                  </p>
                )}
              </div>
            </div>

            {crypto && (
              <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                <div className="rounded-2xl bg-white/10 p-3">
                  <p className="text-blue-100">24h Change</p>
                  <p
                    className={`mt-1 font-semibold ${
                      crypto.price_change_percentage_24h >= 0
                        ? 'text-emerald-200'
                        : 'text-rose-200'
                    }`}
                  >
                    {crypto.price_change_percentage_24h >= 0 ? '+' : ''}
                    {crypto.price_change_percentage_24h?.toFixed(2)}%
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 p-3">
                  <p className="text-blue-100">Market Cap</p>
                  <p className="mt-1 font-semibold">
                    {formatCurrency(crypto.market_cap)}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 p-3">
                  <p className="text-blue-100">24h High</p>
                  <p className="mt-1 font-semibold">
                    {formatPrice(crypto.high_24h)}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 p-3">
                  <p className="text-blue-100">24h Low</p>
                  <p className="mt-1 font-semibold">
                    {formatPrice(crypto.low_24h)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chart + controls */}
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Price (USD) over time
            </h2>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {[1, 7, 30, 90, 365].map((range) => (
                <button
                  key={range}
                  onClick={() => handleRangeChange(range)}
                  className={`rounded-full px-3 py-1 ${
                    days === range
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {range === 1
                    ? '24H'
                    : range === 7
                    ? '7D'
                    : range === 30
                    ? '30D'
                    : range === 90
                    ? '90D'
                    : '1Y'}
                </button>
              ))}
            </div>
          </div>

          {chartData.length === 0 ? (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              No chart data available.
            </p>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="price"
                    dot={false}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Extra stats section */}
        {crypto && (
          <div className="mt-6 grid gap-4 md:grid-cols-3 text-sm">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs font-semibold uppercase text-slate-500">
                Total Volume (24h)
              </p>
              <p className="mt-2 text-base font-semibold">
                {formatCurrency(crypto.total_volume)}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs font-semibold uppercase text-slate-500">
                Circulating Supply
              </p>
              <p className="mt-2 text-base font-semibold">
                {crypto.circulating_supply
                  ? crypto.circulating_supply.toLocaleString()
                  : '—'}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs font-semibold uppercase text-slate-500">
                All-Time High (ATH)
              </p>
              <p className="mt-2 text-base font-semibold">
                {crypto.ath ? formatPrice(crypto.ath) : '—'}
              </p>
              {crypto.ath_date && (
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {new Date(crypto.ath_date).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CryptoDetails;
