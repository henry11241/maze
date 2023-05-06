const randomColor = () => {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);

  // Construct CSS rgb() string
  const colorString = "rgb(" + r + ", " + g + ", " + b + ")";

  return colorString;
}