const pattern = [
  '1111111001011111111',
  '1000001010011000001',
  '1011101011111011101',
  '1011101000111011101',
  '1011101011011011101',
  '1000001001011000001',
  '1111111010101111111',
  '0000000011010000000',
  '1010111010011011010',
  '0111000101110001101',
  '1101011110011110100',
  '0010110001110010111',
  '1111001010101100101',
  '0000000011110010010',
  '1111111010111011101',
  '1000001011001000001',
  '1011101010111011101',
  '1011101001101011101',
  '1011101010011011101',
  '1000001011101000001',
  '1111111010011111111',
]

export function QrPlaceholder() {
  return (
    <div className="qr-wrap" aria-label="Preview QR placeholder; final QR will be generated after the official domain is connected">
      <div className="qr-placeholder" aria-hidden="true">
        {pattern.flatMap((row, rowIndex) => [...row].map((cell, columnIndex) => (
          <span key={`${rowIndex}-${columnIndex}`} className={cell === '1' ? 'qr-cell is-on' : 'qr-cell'} />
        )))}
      </div>
      <div className="qr-copy">
        <span className="eyebrow">Preview placeholder</span>
        <p>Final QR waits for the official PulseLore domain.</p>
        <code>/verify/PL-404-STB-001</code>
      </div>
    </div>
  )
}
