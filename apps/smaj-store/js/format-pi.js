(function () {
  const decidePrecision = (value) => {
    const numeric = Math.abs(Number(value) || 0);
    if (numeric === 0) return 2;
    if (numeric >= 1000) return 2;
    if (numeric >= 1) return 2;
    if (numeric >= 0.1) return 4;
    if (numeric >= 0.01) return 6;
    return 8;
  };

  function formatPiNumber(value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return '0.00';
    const decimals = decidePrecision(numeric);
    return numeric.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  function formatPiLabel(value) {
    return `${formatPiNumber(value)} Pi`;
  }

  window.formatPiNumber = formatPiNumber;
  window.formatPiLabel = formatPiLabel;
})();
