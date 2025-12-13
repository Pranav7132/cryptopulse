import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

const CryptoConverter = ({ cryptoData }) => {
  const [amount, setAmount] = useState('');
  const [fromCrypto, setFromCrypto] = useState('');
  const [toCurrency, setToCurrency] = useState('usd');
  const [result, setResult] = useState(null);

  // Static FX rates relative to 1 USD (approximate, just to keep converter functional without extra APIs)
  const conversionRates = {
    usd: 1,
    eur: 0.92,
    gbp: 0.78,
    jpy: 153.2,
    aud: 1.54,
    cad: 1.37,
    chf: 0.9,
    cny: 7.24,
    inr: 83.52,
    krw: 1373.12,
  };

  const currencies = [
    { code: 'usd', name: 'US Dollar', symbol: '$' },
    { code: 'eur', name: 'Euro', symbol: '€' },
    { code: 'gbp', name: 'British Pound', symbol: '£' },
    { code: 'jpy', name: 'Japanese Yen', symbol: '¥' },
    { code: 'aud', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'cad', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'chf', name: 'Swiss Franc', symbol: 'CHF' },
    { code: 'cny', name: 'Chinese Yuan', symbol: '¥' },
    { code: 'inr', name: 'Indian Rupee', symbol: '₹' },
    { code: 'krw', name: 'South Korean Won', symbol: '₩' },
  ];

  // When cryptoData first loads, default to BTC (or first coin)
  useEffect(() => {
    if (!fromCrypto && cryptoData && cryptoData.length > 0) {
      const btc = cryptoData.find(
        (c) => c.symbol && c.symbol.toLowerCase() === 'btc'
      );
      setFromCrypto((btc || cryptoData[0]).id);
    }
  }, [cryptoData, fromCrypto]);

  const handleAmountChange = (value) => {
    setAmount(value);
    setResult(null);
  };

  const handleFromCryptoChange = (value) => {
    setFromCrypto(value);
    setResult(null);
  };

  const handleToCurrencyChange = (value) => {
    setToCurrency(value);
    setResult(null);
  };

  const handleConvert = () => {
    const selectedCrypto = cryptoData?.find((crypto) => crypto.id === fromCrypto);
    const numericAmount = parseFloat(amount);

    if (!selectedCrypto || !numericAmount || numericAmount <= 0) {
      setResult(null);
      return;
    }

    const rate = conversionRates[toCurrency] || 1;

    // current_price from dashboard is already in USD
    const amountInUsd = numericAmount * selectedCrypto.current_price;
    const finalAmount = amountInUsd * rate;

    const currencyInfo =
      currencies.find((c) => c.code === toCurrency) || currencies[0];

    setResult({
      fromAmount: numericAmount,
      fromCrypto: selectedCrypto.name,
      fromSymbol: selectedCrypto.symbol.toUpperCase(),
      toAmount: finalAmount,
      toCurrency: currencyInfo.name,
      currencyCode: currencyInfo.code.toUpperCase(),
      currencySymbol: currencyInfo.symbol,
      usdPrice: selectedCrypto.current_price,
      targetRate: rate,
    });
  };

  if (!cryptoData || cryptoData.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-6 text-center shadow-md dark:bg-slate-900">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Crypto data is not available yet. Please go back to the Price Tracker
          tab and wait for the data to load.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl rounded-3xl bg-white p-6 shadow-lg shadow-slate-900/5 dark:bg-slate-900">
      <h2 className="mb-1 text-xl font-bold text-gray-900 dark:text-gray-100">
        Crypto Converter
      </h2>
      <p className="mb-6 text-xs text-gray-500 dark:text-gray-400">
        Convert from any listed crypto to your preferred fiat currency using
        the latest prices from the dashboard.
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-6">
        <div>
          <label
            htmlFor="amount"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Amount
          </label>
          <input
            id="amount"
            type="number"
            min="0"
            step="any"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            placeholder="e.g. 0.5"
          />
        </div>

        <div>
          <label
            htmlFor="fromCrypto"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            From (Crypto)
          </label>
          <select
            id="fromCrypto"
            value={fromCrypto}
            onChange={(e) => handleFromCryptoChange(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          >
            {cryptoData.map((crypto) => (
              <option key={crypto.id} value={crypto.id}>
                {crypto.name} ({crypto.symbol.toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="toCurrency"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            To (Fiat Currency)
          </label>
          <select
            id="toCurrency"
            value={toCurrency}
            onChange={(e) => handleToCurrencyChange(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          >
            {currencies.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.name} ({currency.symbol})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-6 flex justify-center">
        <button
          onClick={handleConvert}
          className="inline-flex items-center rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-60"
          disabled={!amount || !fromCrypto}
        >
          Convert
          <ArrowRight size={16} className="ml-2" />
        </button>
      </div>

      {result && (
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900 shadow-sm dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-blue-100">
          <p className="mb-1">
            <span className="font-semibold">
              {result.fromAmount} {result.fromSymbol}
            </span>{' '}
            ≈{' '}
            <span className="font-semibold">
              {result.currencySymbol}
              {result.toAmount.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}{' '}
              {result.currencyCode}
            </span>
          </p>
          <p className="mt-2 text-xs opacity-80">
            1 {result.fromSymbol} ≈ {result.currencySymbol}
            {(result.usdPrice * result.targetRate).toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}{' '}
            {result.currencyCode}
          </p>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        <p>* Uses the same market data as the Price Tracker table.</p>
        <p>* Fiat conversion rates are approximate and for display only.</p>
      </div>
    </div>
  );
};

export default CryptoConverter;
