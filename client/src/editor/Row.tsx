import React from "react";
import "../styles/row.css";
import Pixel from "./Pixel";

export default function Row(props: any) {
  const { width, selectedColor } = props;

  let pixels = [];

  for (let i = 0; i < width; i++) {
    pixels.push(<Pixel key={i} selectedColor={selectedColor} />);
  }

  return <div className="row">{pixels}</div>;
}
