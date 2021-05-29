import * as Vibrant from "node-vibrant";

const rgbToHex = (r, g, b) =>
  "#" +
  [r, g, b]
    .map((x) => {
      const hex = x.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    })
    .join("");

export const computeProminentColors = async (coverUrl) => {
  try {
    let swatch = await Vibrant.from(coverUrl).getSwatches();

    swatch = Object.values(swatch).map((color) => color.hex);

    return {
      colors: swatch,
      err: null,
    };
  } catch (err) {
    return { colors: null, err: err.message };
  }
};

export default async function getProminentCoverColors(req, res) {
  const { coverUrl } = req.query;

  if (!coverUrl)
    return res
      .status(400)
      .send("'coverUrl' parameter is missing for the request.");

  const { colors, err } = await computeProminentColors(coverUrl);

  if (err) {
    return res.status(400).send(err);
  }

  res.status(200).send({ colors, err });
}
