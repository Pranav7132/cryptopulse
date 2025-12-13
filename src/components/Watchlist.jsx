import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const USER_ID = "demoUser";

const Watchlist = () => {
  const navigate = useNavigate();

  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch watchlist coins
  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        setLoading(true);

        // 1. Get watchlist IDs from MongoDB
        const wlRes = await fetch(
          "http://localhost:5000/api/watchlist/" + USER_ID
        );
        const wlData = await wlRes.json();

        if (!wlData.coins || wlData.coins.length === 0) {
          setCoins([]);
          setLoading(false);
          return;
        }

        // 2. Fetch live data from CoinGecko
        const ids = wlData.coins.join(",");
        const cgRes = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&price_change_percentage=24h`
        );

        if (!cgRes.ok) {
          throw new Error("Failed to fetch coin data");
        }

        const cgData = await cgRes.json();
        setCoins(cgData);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load watchlist");
        setLoading(false);
      }
    };

    fetchWatchlist();
  }, []);

  // Remove coin from watchlist
  const removeFromWatchlist = async (coinId) => {
    try {
      await fetch(
        "http://localhost:5000/api/watchlist/" + USER_ID,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ coinId }),
        }
      );

      // Update UI instantly
      setCoins((prev) => prev.filter((c) => c.id !== coinId));
    } catch (err) {
      console.error("Failed to remove coin from watchlist", err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-100 dark:bg-slate-950">
        <p className="text-lg text-gray-700 dark:text-gray-300">
          Loading watchlist…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-100 dark:bg-slate-950">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 p-4 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">⭐ Watchlist</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Your starred cryptocurrencies with live market data
          </p>
        </div>

        {coins.length === 0 ? (
          /* Empty state */
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-lg font-medium">No coins in your watchlist</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Click the ⭐ icon on any coin to add it here.
            </p>
          </div>
        ) : (
          /* Watchlist table */
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  <th className="px-4 py-3">Coin</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">24h %</th>
                  <th className="px-4 py-3">Market Cap</th>
                  <th className="px-4 py-3 text-center">★</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {coins.map((coin) => (
                  <tr
                    key={coin.id}
                    onClick={() =>
                      navigate(`/crypto/${coin.id}`, {
                        state: { crypto: coin },
                      })
                    }
                    className="cursor-pointer bg-white transition hover:bg-blue-50/60 dark:bg-slate-900 dark:hover:bg-slate-800"
                  >
                    <td className="whitespace-nowrap px-4 py-4">
                      <div className="flex items-center">
                        <img
                          src={coin.image}
                          alt={coin.name}
                          className="h-8 w-8 rounded-full"
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium">
                            {coin.name}
                          </div>
                          <div className="text-xs uppercase text-slate-500 dark:text-slate-400">
                            {coin.symbol}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-sm">
                      ${coin.current_price.toLocaleString()}
                    </td>

                    <td
                      className={`px-4 py-4 text-sm font-medium ${
                        coin.price_change_percentage_24h >= 0
                          ? "text-emerald-500"
                          : "text-rose-500"
                      }`}
                    >
                      {coin.price_change_percentage_24h >= 0 ? "+" : ""}
                      {coin.price_change_percentage_24h.toFixed(2)}%
                    </td>

                    <td className="px-4 py-4 text-sm">
                      ${coin.market_cap.toLocaleString()}
                    </td>

                    {/* Remove button */}
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromWatchlist(coin.id);
                        }}
                        className="text-lg text-yellow-400 transition hover:text-rose-500"
                        title="Remove from watchlist"
                      >
                        ★
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Watchlist;
