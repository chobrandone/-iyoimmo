export default function Logo({ size = 'md', dark = false }) {
  const heights = { sm: 28, md: 36, lg: 48, xl: 64 };
  const h = heights[size] || heights.md;
  return (
    <img
      src="/logo.png"
      alt="IYO IMMO"
      style={{
        height: h,
        width: 'auto',
        objectFit: 'contain',
        filter: dark ? 'brightness(0) invert(1)' : 'none',
      }}
    />
  );
}
