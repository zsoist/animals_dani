export async function encodeImage(
  source: CanvasImageSource,
  width: number,
  height: number,
) {
  const canvas = document.createElement("canvas");
  const ratio = Math.min(1, 1800 / Math.max(width, height));
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No pudimos abrir la imagen.");
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  let result = canvas.toDataURL("image/webp", 0.9);
  let quality = 0.8;
  while (result.length > 430000 && quality >= 0.35) {
    result = canvas.toDataURL("image/webp", quality);
    quality -= 0.1;
  }
  if (result.length > 450000)
    throw new Error(
      "La imagen tiene demasiado detalle. Recorta una sola pregunta.",
    );
  return result;
}
