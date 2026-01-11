import React from "react";
import QRScannerEnhanced from "./QRScannerEnhanced";

export default function QRScanner({ onScanned }) {
  return <QRScannerEnhanced onScanned={onScanned} onClose={() => {}} />;
}