import React, { useState } from "react";
import "../styles/editor.css";
// import { CirclePicker } from "react-color";
import DrawingPanel from "./DrawingPanel";

interface IProps {
  room: string | undefined;
}

export default function Editor(props: IProps) {
  const [panelWidth, setPanelWidth] = useState<any>(16);
  const [panelHeight, setPanelHeight] = useState<any>(16);
  const [selectedColor, setColor] = useState("#f44336");

  function changeColor(color: any) {
    setColor(color.hex);
  }

  return (
    <div id="editor">
      <h1>{props.room}</h1>

      {/* <button className="button">
        Reset
      </button> */}

      {/* {hideOptions && (
        <CirclePicker color={selectedColor} onChangeComplete={changeColor} />
      )} */}

      <DrawingPanel
        width={panelWidth}
        height={panelHeight}
        selectedColor={selectedColor}
      />
    </div>
  );
}
